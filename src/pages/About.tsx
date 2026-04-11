import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Zap, Shield, ZapIcon, Globe } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>About Us - Sohelix Free Online Image Tools</title>
        <meta name="description" content="Learn about Sohelix, our mission, and why we provide 100% free, client-side, secure image processing tools for everyone." />
      </Helmet>

      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          About Sohelix
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400">
          Empowering creators with fast, secure, and free online image tools.
        </p>
      </div>

      <div className="mt-16 prose prose-blue prose-lg mx-auto dark:prose-invert">
        <h2>What is Sohelix?</h2>
        <p>
          Sohelix is a comprehensive suite of online image processing tools designed to make your digital life easier. Whether you are a web developer optimizing assets for a new site, a photographer resizing images for social media, or just someone who needs to quickly convert a file format, Sohelix provides the tools you need directly in your browser.
        </p>

        <h2>Our Mission & Vision</h2>
        <p>
          Our mission is to democratize access to high-quality digital tools. We believe that basic image manipulation shouldn't require expensive software subscriptions or compromising your privacy by uploading personal photos to unknown servers. Our vision is to build the most reliable, fastest, and most secure client-side toolset on the web.
        </p>

        <h2>Why Trust Us?</h2>
        <p>
          Unlike many other online tools, <strong>Sohelix operates 100% client-side</strong>. This means that when you use our image compressor, resizer, or converter, your files never leave your device. All processing is done using the power of your own web browser. 
        </p>
        <ul>
          <li><strong>Zero Uploads:</strong> We don't have access to your files.</li>
          <li><strong>Lightning Fast:</strong> No waiting for files to upload or download from a server.</li>
          <li><strong>Always Free:</strong> No hidden fees, no watermarks (unless you add them!), and no usage limits.</li>
        </ul>

        <h2>The Tools We Provide</h2>
        <p>
          We are constantly expanding our toolset. Currently, we offer a wide range of image utilities including:
        </p>
        <ul>
          <li>Image Compression & Resizing</li>
          <li>Format Conversion (JPG, PNG, WebP)</li>
          <li>Image Cropping & Rotation</li>
          <li>Watermarking & Meme Generation</li>
          <li>Base64 Encoding</li>
        </ul>
        <p>
          Thank you for choosing Sohelix. We are dedicated to continuously improving our platform to serve you better.
        </p>
      </div>
    </div>
  );
};
