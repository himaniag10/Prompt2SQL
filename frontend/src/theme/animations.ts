export const animations = {
  transition: {
    default: 'all 0.2s ease-in-out',
    fast: 'all 0.1s ease-in-out',
    slow: 'all 0.3s ease-in-out',
  },
  framer: {
    pageTransition: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      transition: { duration: 0.2 },
    },
    hover: {
      scale: 1.02,
    },
    tap: {
      scale: 0.98,
    }
  }
};
