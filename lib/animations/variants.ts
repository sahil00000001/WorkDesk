// Framer Motion animation variants for consistent animations

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
}

export const slideInFromBottom = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  exit: {
    y: 20,
    opacity: 0,
    transition: { duration: 0.2 }
  }
}

export const slideInFromRight = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  exit: {
    x: 100,
    opacity: 0,
    transition: { duration: 0.3 }
  }
}

export const slideInFromLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: { duration: 0.3 }
  }
}

export const scaleIn = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: { duration: 0.2 }
  }
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

export const staggerItem = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4 }
  }
}

export const cardHover = {
  rest: {
    scale: 1,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    transition: { duration: 0.2 }
  }
}

export const buttonTap = {
  scale: 0.97
}

// Timing constants
export const ANIMATION_TIMING = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
}

// Easing functions
export const EASING = {
  easeOut: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.6, 1],
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
}

// Stagger delay
export const STAGGER = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.15,
}
