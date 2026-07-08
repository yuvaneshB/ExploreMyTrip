import { useWishlistContext } from '../context/WishlistContext.jsx';

export const useWishlist = () => {
  return useWishlistContext();
};

export default useWishlist;
