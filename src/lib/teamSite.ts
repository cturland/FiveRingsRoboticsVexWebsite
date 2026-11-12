const sites = {
  'five-rings': {
    slug: 'five-rings',
    name: 'Five Rings Robotics',
    shortName: 'Five Rings',
    hero: ['Five Rings', 'Robotics'],
    number: '21052A',
    instagramHandle: 'the.vextagram',
    logo: '/images/FRRLogoBasic.png',
    navLogo: '/images/FRRLogoBasic.png',
    intro: 'Representing the International School of Lausanne with a student-led focus on engineering quality, match discipline, and season-long improvement.',
    displayLogo: '/images/FRRLogo.png',
    favicon: '/images/favicon/favicon-32x32.png',
    appleIcon: '/images/favicon/apple-touch-icon.png',
    manifestIcons: ['/images/favicon/android-chrome-192x192.png', '/images/favicon/android-chrome-512x512.png'],
    logoBackground: 'bg-white/5',
    themeColor: '#09111d',
    worldsDescription: 'Follow Five Rings Robotics as they represent Switzerland at the World VEX Finals.',
  },
  'cool-runnings': {
    slug: 'cool-runnings',
    name: 'Cool Runnings',
    shortName: 'Cool Runnings',
    hero: ['Cool', 'Runnings'],
    number: '21052B',
    instagramHandle: 'coolrunningsvex',
    logo: '/images/cool-runnings/logo.webp',
    navLogo: '/images/cool-runnings/icon-192.png',
    intro: 'We design, build, and compete in VEX Robotics as team 21052B from the International School of Lausanne.',
    displayLogo: '/images/cool-runnings/logo.webp',
    favicon: '/images/cool-runnings/icon-32.png',
    appleIcon: '/images/cool-runnings/icon-180.png',
    manifestIcons: ['/images/cool-runnings/icon-192.png', '/images/cool-runnings/icon-512.png'],
    logoBackground: 'bg-white',
    themeColor: '#091810',
    worldsDescription: 'Follow Cool Runnings competition fixtures and results.',
  },
} as const;

export const teamSite = process.env.NEXT_PUBLIC_TEAM_SITE === 'cool-runnings'
  ? sites['cool-runnings']
  : sites['five-rings'];
