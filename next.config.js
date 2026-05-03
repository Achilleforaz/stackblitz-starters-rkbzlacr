const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/prism',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
