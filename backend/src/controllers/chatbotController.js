import axios from 'axios';
import Tour from '../models/tour.js';
import AgentTour from '../models/agentTour.js';
import Booking from '../models/booking.js';

export const queryChatbot = async (req, res, next) => {
  try {
    const { message, conversationHistory } = req.body;

    // 1. Inputs validation
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message is too long. Please shorten your question.' });
    }

    // 2. Check API Key configuration
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY environment variable is not defined.');
      return res.status(500).json({ 
        success: false, 
        error: 'Chatbot temporarily unavailable',
        message: 'Sorry, the AI Travel Assistant is currently offline due to a configuration issue. Please try again later.' 
      });
    }

    // 3. Grounding: Fetch published tours from database
    const agentTours = await AgentTour.find({ status: 'Published' })
      .select('title location pricingPlans departures durationDays')
      .lean();
    const standardTours = await Tour.find({ status: 'Published' })
      .select('title location pricingPlans departures durationDays')
      .lean();
    
    const allTours = [...agentTours, ...standardTours];

    // Filter in-memory based on location keywords in user's query to optimize token usage
    let matchedTours = allTours;
    const lowerMessage = message.toLowerCase();
    
    const mentionedTour = allTours.find(t => {
      const loc = t.location?.toLowerCase();
      const title = t.title?.toLowerCase();
      return (loc && lowerMessage.includes(loc)) || (title && lowerMessage.includes(title));
    });

    if (mentionedTour) {
      const targetLoc = mentionedTour.location?.toLowerCase();
      matchedTours = allTours.filter(t => t.location?.toLowerCase().includes(targetLoc) || t.title?.toLowerCase().includes(targetLoc));
    }

    // Limit to 5 tours to avoid bloating prompt content
    matchedTours = matchedTours.slice(0, 5);

    // 4. Grounding: Fetch user bookings context if authenticated
    let bookingContext = '';
    if (req.user) {
      const bookings = await Booking.find({ user: req.user._id })
        .populate('tour')
        .sort({ createdAt: -1 })
        .limit(5);

      if (bookings.length > 0) {
        bookingContext = "The user is logged in. Here are the user's recent bookings on ExploreMyTrip:\n" + bookings.map(b => {
          const tourTitle = b.tour ? b.tour.title : 'Tour';
          return `- Booking ID: ${b._id}, Tour: ${tourTitle}, Date: ${new Date(b.departureDate).toLocaleDateString()}, Status: ${b.status}, Amount Paid: $${b.amountPaid}, Total Amount: $${b.totalAmount}`;
        }).join('\n');
      } else {
        bookingContext = 'The user is logged in but has no bookings yet.';
      }
    } else {
      bookingContext = 'The user is browsing as an anonymous guest (not logged in).';
    }

    // 5. Construct secure system instructions
    const systemInstruction = `You are the ExploreMyTrip AI Travel Assistant. Your goal is to help users with travel plans, destination suggestions, packing lists, itineraries, and guide them on using the ExploreMyTrip platform.
You must be concise, friendly, and helpful. Always maintain the ExploreMyTrip brand identity.

Important Guidelines:
1. Ground your answers using ONLY the real tour data provided below. NEVER invent or fabricate tours, prices, dates, or seat availability. If no tours match, state that we don't have that package currently but can check for other getaways.
2. If the user asks about booking status or if their booking is confirmed, use the "Real Booking Data" below. If guest, instruct them to visit the "My Bookings" page or log in, and do not fabricate any booking confirmations.
3. The platform URL routes are:
   - Home: "/"
   - Explore Tours: "/tours"
   - Wishlist: "/wishlist"
   - My Bookings: "/bookings"
   Provide links or recommendations to these pages when appropriate.
4. If asked about cancellations or refunds: Explain that bookings can be cancelled/refunded from the "My Bookings" page in accordance with platform policies.

Real Tour Data currently available:
${matchedTours.length > 0 ? matchedTours.map(t => {
  const basePrice = t.pricingPlans?.[0]?.price ?? 'N/A';
  const dates = t.departures && t.departures.length > 0 ? t.departures.map(d => new Date(d.date).toLocaleDateString()).join(', ') : 'N/A';
  return `- Title: ${t.title}, Location: ${t.location}, Duration: ${t.durationDays} days, Price: $${basePrice}, Available Dates: [${dates}]`;
}).join('\n') : 'No tours available.'}

Real Booking Data:
${bookingContext}
`;

    // 6. Map conversation history to Gemini API format
    const contents = [];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Map to Gemini roles: 'user' and 'model'
      const recentHistory = conversationHistory.slice(-10); // Keep last 10 messages for context memory
      recentHistory.forEach(item => {
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }]
        });
      });
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const apiPayload = {
      contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      }
    };

    // 7. Make API request to Gemini API with 15-second timeout
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await axios.post(apiURL, apiPayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error('Response text from Gemini API was empty.');
    }

    res.status(200).json({ success: true, reply: responseText });
  } catch (error) {
    console.error('Chatbot API Error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({ 
      success: false, 
      error: 'Chatbot temporarily unavailable',
      message: 'Sorry, I couldn’t respond right now. Please try again.' 
    });
  }
};
