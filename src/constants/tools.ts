import { Tool } from '../types';

export const TOOLS: Tool[] = [
  {
    id: 'compress-image',
    name: 'Compress Image',
    title: 'Compress Image Online',
    description: 'Reduce image file size without losing quality. Perfect for web optimization.',
    icon: 'Minimize2',
    slug: 'compress-image',
    category: 'optimize',
    isNew: true,
    seo: {
      title: 'Free Online Image Compressor - Reduce Image Size Without Quality Loss',
      description: 'Compress JPG, PNG, SVG, and GIF images online for free. Reduce file size by up to 90% while maintaining high quality. No upload required, 100% secure.',
      keywords: ['image compressor', 'reduce image size', 'compress jpg', 'compress png', 'online image optimizer'],
    },
    features: [
      'Fast client-side processing',
      'No file upload (privacy first)',
      'Adjustable quality levels',
      'Supports JPG, PNG, WebP',
    ],
    benefits: [
      'Improve website loading speed',
      'Save storage space',
      'Better SEO rankings',
    ],
    useCases: [
      'Web developers optimizing assets',
      'Bloggers uploading images to CMS',
      'Social media managers',
    ],
    faqs: [
      {
        question: 'Is this image compressor free?',
        answer: 'Yes, Sohelix Image Compressor is 100% free to use with no hidden costs or limits.',
      },
      {
        question: 'Does it affect image quality?',
        answer: 'Our tool uses advanced algorithms to reduce file size while maintaining the best possible visual quality.',
      },
      {
        question: 'Are my images safe?',
        answer: 'Absolutely. All processing happens in your browser. Your images are never uploaded to our servers.',
      },
    ],
    longContent: 'Optimizing images is crucial for modern web performance. Large image files can slow down your website, leading to poor user experience and lower search engine rankings. Sohelix provides a professional-grade compression tool that works entirely in your browser. This means your data stays private and the processing is lightning fast. Whether you are a developer looking to shave off kilobytes from your production assets or a casual user trying to save space on your phone, our <a href="/tools/compress-image" class="underline hover:text-blue-200">compress images online</a> tool is designed to deliver the best results with zero friction. If you also need to change dimensions, check out our <a href="/tools/resize-image" class="underline hover:text-blue-200">image resizer</a>.',
  },
  {
    id: 'resize-image',
    name: 'Resize Image',
    title: 'Resize Image Online',
    description: 'Change image dimensions by pixels or percentage easily.',
    icon: 'Maximize2',
    slug: 'resize-image',
    category: 'edit',
    seo: {
      title: 'Free Online Image Resizer - Change Image Dimensions Fast',
      description: 'Resize JPG, PNG, and WebP images online for free. Change width and height in pixels or percentage. Maintain aspect ratio and high quality.',
      keywords: ['image resizer', 'resize image online', 'change image dimensions', 'resize jpg', 'resize png'],
    },
    features: [
      'Resize by pixels or percentage',
      'Maintain aspect ratio lock',
      'Bulk resizing support',
      'Instant preview',
    ],
    benefits: [
      'Perfect for social media profiles',
      'Standardize image sizes for galleries',
      'Quick adjustments for documents',
    ],
    useCases: [
      'Creating thumbnails',
      'Fitting images into specific UI layouts',
      'Preparing photos for printing',
    ],
    faqs: [
      {
        question: 'Can I resize multiple images at once?',
        answer: 'Yes, you can upload and resize multiple images simultaneously.',
      },
      {
        question: 'Will resizing make my image blurry?',
        answer: 'Upscaling an image beyond its original size may cause blurriness, but downscaling maintains high clarity.',
      },
    ],
    longContent: 'Resizing images is a common task for anyone working with digital media. Whether you need a specific width for a blog post or a square aspect ratio for Instagram, Sohelix makes it simple. Our resizer allows you to input exact pixel values or use a percentage slider for quick adjustments. With the "Maintain Aspect Ratio" feature, you never have to worry about stretching or distorting your photos. Everything happens locally on your device, ensuring maximum speed and security. After resizing, you might want to <a href="/tools/compress-image" class="underline hover:text-blue-200">compress your image</a> to save even more space.',
  },
  {
    id: 'crop-image',
    name: 'Crop Image',
    title: 'Crop Image Online',
    description: 'Remove unwanted parts of an image with precision.',
    icon: 'Crop',
    slug: 'crop-image',
    category: 'edit',
    seo: {
      title: 'Free Online Image Cropper - Crop JPG, PNG, WebP Easily',
      description: 'Crop your images online for free. Use preset aspect ratios or free-form selection. High precision cropping with instant download.',
      keywords: ['image cropper', 'crop image online', 'remove image borders', 'crop photo'],
    },
    features: [
      'Preset aspect ratios (1:1, 4:3, 16:9)',
      'Free-form selection',
      'Rotation while cropping',
      'High-res output',
    ],
    benefits: [
      'Focus on the subject',
      'Remove distracting backgrounds',
      'Create perfect profile pictures',
    ],
    useCases: [
      'Photography editing',
      'E-commerce product photos',
      'Personal photo archiving',
    ],
    faqs: [
      {
        question: 'Is the cropping tool precise?',
        answer: 'Yes, you can drag the corners to select the exact area you want to keep.',
      },
    ],
    longContent: 'Sometimes a photo is perfect except for a few distracting elements at the edges. Our cropping tool gives you the control to frame your images exactly how you want them. With support for common aspect ratios, you can quickly prepare images for any platform. Like all Sohelix tools, the cropper runs entirely in your browser, keeping your private photos private. If you need to fix the orientation before cropping, try our <a href="/tools/image-rotate" class="underline hover:text-blue-200">image rotation tool</a>.',
  },
  {
    id: 'jpg-to-png',
    name: 'JPG to PNG',
    title: 'Convert JPG to PNG',
    description: 'Convert JPG images to PNG format with transparency support.',
    icon: 'FileImage',
    slug: 'jpg-to-png',
    category: 'convert',
    seo: {
      title: 'Convert JPG to PNG Online - Free & High Quality',
      description: 'Convert your JPG files to PNG format online for free. High quality conversion, no file size limits, and 100% secure processing.',
      keywords: ['jpg to png', 'convert jpg to png', 'online image converter', 'jpg to png free'],
    },
    features: [
      'High fidelity conversion',
      'Batch processing',
      'No quality loss',
      'Instant download',
    ],
    benefits: [
      'Better compatibility for some apps',
      'Lossless format conversion',
      'Easy to use',
    ],
    useCases: [
      'Developers needing PNG assets',
      'Users converting photos for specific software',
    ],
    faqs: [
      {
        question: 'Will the file size increase?',
        answer: 'PNG is a lossless format, so the file size might be larger than the original JPG.',
      },
    ],
    longContent: 'Converting between image formats is a fundamental need for designers and developers. JPG is great for photos, but PNG is often required for logos or images that need transparency. Sohelix provides a fast, reliable way to <a href="/tools/jpg-to-png" class="underline hover:text-blue-200">convert image formats</a> without ever sending them to a server. If you need the reverse, use our <a href="/tools/png-to-jpg" class="underline hover:text-blue-200">PNG to JPG converter</a>.',
  },
  {
    id: 'webp-converter',
    name: 'WebP Converter',
    title: 'Convert to WebP',
    description: 'Convert any image to WebP for superior web performance.',
    icon: 'Zap',
    slug: 'webp-converter',
    category: 'convert',
    seo: {
      title: 'Free WebP Converter - Convert JPG/PNG to WebP Online',
      description: 'Convert your images to WebP format for faster website loading. Free online converter for JPG, PNG, and more.',
      keywords: ['webp converter', 'convert to webp', 'jpg to webp', 'png to webp', 'optimize for web'],
    },
    features: [
      'Superior compression',
      'Supports transparency',
      'Modern web standard',
    ],
    benefits: [
      'Faster page loads',
      'Better Core Web Vitals',
      'Smaller file sizes',
    ],
    useCases: [
      'SEO optimization',
      'Mobile app assets',
    ],
    faqs: [],
    longContent: 'WebP is the modern image format for the web. It provides superior lossless and lossy compression for images on the web. Using WebP, webmasters and web developers can create smaller, richer images that make the web faster.',
  },
  {
    id: 'png-to-jpg',
    name: 'PNG to JPG',
    title: 'Convert PNG to JPG',
    description: 'Convert PNG images to JPG format quickly.',
    icon: 'FileImage',
    slug: 'png-to-jpg',
    category: 'convert',
    seo: {
      title: 'Convert PNG to JPG Online - Free & Fast',
      description: 'Convert your PNG files to JPG format online for free. High quality conversion with adjustable quality settings.',
      keywords: ['png to jpg', 'convert png to jpg', 'online image converter'],
    },
    features: ['Fast conversion', 'Quality control', 'Batch support'],
    benefits: ['Reduce file size', 'Better compatibility'],
    useCases: ['Web optimization', 'Email attachments'],
    faqs: [],
    longContent: 'PNG files are great for transparency, but they can be large. Converting them to JPG is a great way to save space when transparency is not needed.',
  },
  {
    id: 'image-to-base64',
    name: 'Image to Base64',
    title: 'Convert Image to Base64',
    description: 'Encode your images into Base64 strings for CSS or HTML.',
    icon: 'Code',
    slug: 'image-to-base64',
    category: 'misc',
    seo: {
      title: 'Image to Base64 Converter - Encode Images Online',
      description: 'Convert images to Base64 strings online. Perfect for embedding images directly into HTML or CSS files.',
      keywords: ['image to base64', 'base64 encoder', 'data uri generator'],
    },
    features: ['Instant encoding', 'Copy to clipboard', 'Data URI support'],
    benefits: ['Reduce HTTP requests', 'Embed images in code'],
    useCases: ['Web development', 'Email templates'],
    faqs: [],
    longContent: 'Base64 encoding allows you to embed image data directly into your code. This can reduce the number of HTTP requests your website makes, potentially improving load times for small assets.',
  },
  {
    id: 'image-watermark',
    name: 'Image Watermark',
    title: 'Add Watermark to Image',
    description: 'Protect your images with text or image watermarks.',
    icon: 'Stamp',
    slug: 'image-watermark',
    category: 'edit',
    seo: {
      title: 'Add Watermark to Image Online - Free & Secure',
      description: 'Protect your photos by adding text or image watermarks online. Customize position, opacity, and size.',
      keywords: ['add watermark', 'watermark image', 'protect photos', 'online watermark tool'],
    },
    features: ['Text & Image watermarks', 'Custom positioning', 'Opacity control'],
    benefits: ['Protect copyright', 'Brand your images'],
    useCases: ['Photographers', 'Content creators'],
    faqs: [],
    longContent: 'Watermarking is essential for protecting your creative work online. Sohelix allows you to add custom text or your own logo as a watermark to any image, all within your browser.',
  },
  {
    id: 'meme-generator',
    name: 'Meme Generator',
    title: 'Online Meme Generator',
    description: 'Create funny memes with custom text and images.',
    icon: 'Smile',
    slug: 'meme-generator',
    category: 'edit',
    seo: {
      title: 'Free Online Meme Generator - Create Memes Instantly',
      description: 'Create your own memes online for free. Upload your images and add custom text. Fast, fun, and easy to use.',
      keywords: ['meme generator', 'make a meme', 'online meme maker', 'custom memes'],
    },
    features: ['Custom text', 'Drag & drop text', 'Font options'],
    benefits: ['Quick creation', 'Shareable content'],
    useCases: ['Social media', 'Entertainment'],
    faqs: [],
    longContent: 'Memes are the language of the internet. Our meme generator makes it easy to turn any image into a viral sensation. Add top and bottom text, adjust fonts, and download your creation in seconds.',
  },
  {
    id: 'image-rotate',
    name: 'Image Rotate',
    title: 'Rotate Image Online',
    description: 'Rotate your images clockwise or counter-clockwise.',
    icon: 'RotateCw',
    slug: 'image-rotate',
    category: 'edit',
    seo: {
      title: 'Rotate Image Online - Free & Instant',
      description: 'Rotate your images 90, 180, or 270 degrees online. Free tool for JPG, PNG, and WebP.',
      keywords: ['rotate image', 'turn image', 'image rotation tool'],
    },
    features: ['90° increments', 'Custom rotation', 'Instant preview'],
    benefits: ['Fix orientation', 'Creative adjustments'],
    useCases: ['Fixing mobile photos', 'Design work'],
    faqs: [],
    longContent: 'Sometimes images come out sideways or upside down. Our rotation tool lets you fix the orientation of your photos quickly and easily.',
  },
  {
    id: 'blur-image',
    name: 'Blur Image',
    title: 'Blur Image Online',
    description: 'Apply blur effects to your images or specific areas.',
    icon: 'Droplets',
    slug: 'blur-image',
    category: 'edit',
    seo: {
      title: 'Blur Image Online - Free Blur Effect Tool',
      description: 'Apply professional blur effects to your images online. Adjust blur intensity and focus.',
      keywords: ['blur image', 'image blur tool', 'soften photo'],
    },
    features: ['Adjustable intensity', 'Gaussian blur', 'Fast processing'],
    benefits: ['Hide sensitive info', 'Creative depth of field'],
    useCases: ['Privacy protection', 'Design aesthetics'],
    faqs: [],
    longContent: 'Blurring can be used for both privacy and artistic effect. Whether you need to hide a face or create a soft background for text, our blur tool is here to help.',
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    title: 'Professional QR Code Generator',
    description: 'Create custom QR codes for URLs, text, WiFi, and more with logos and styling.',
    icon: 'QrCode',
    slug: 'qr-code-generator',
    category: 'misc',
    isNew: true,
    seo: {
      title: 'Free Online QR Code Generator - Create Custom QR Codes with Logo',
      description: 'Generate professional QR codes online for free. Support for URLs, Text, Email, WiFi, and more. Customize colors, styles, and add your logo.',
      keywords: ['qr code generator', 'create qr code', 'custom qr code', 'qr code with logo', 'free qr generator'],
    },
    features: [
      'Multiple input types (URL, Text, WiFi, etc.)',
      'Custom colors and styles',
      'Add custom logo inside QR',
      'Download as PNG, SVG, or JPG',
      'Bulk generation support'
    ],
    benefits: [
      'Easy sharing of information',
      'Professional branding',
      'Trackable marketing assets',
    ],
    useCases: [
      'Business cards',
      'Marketing materials',
      'WiFi access sharing',
      'Contact information sharing'
    ],
    faqs: [
      {
        question: 'Can I add my logo to the QR code?',
        answer: 'Yes, you can upload any image to be placed in the center of your QR code.'
      },
      {
        question: 'Do these QR codes expire?',
        answer: 'No, the QR codes generated are static and will work as long as the underlying data (like a URL) is valid.'
      }
    ],
    longContent: 'QR codes have become an essential tool for bridging the physical and digital worlds. Whether you need a simple URL link or a complex WiFi configuration, our <a href="/tools/qr-code-generator" class="underline hover:text-blue-200">QR code generator</a> provides all the professional features you need. Customize the dots, corners, and colors to match your brand, and even add your logo for a truly professional look. Everything is processed locally in your browser for maximum privacy.'
  },
  {
    id: 'favicon-generator',
    name: 'Favicon Generator',
    title: 'Favicon Generator from Image',
    description: 'Convert any image into all standard favicon sizes for your website.',
    icon: 'Layout',
    slug: 'favicon-generator',
    category: 'optimize',
    isNew: true,
    seo: {
      title: 'Free Online Favicon Generator - Create Favicons for All Devices',
      description: 'Generate all standard favicon sizes from a single image. Support for 16x16, 32x32, Apple Touch icons, and more. Download as a ZIP file.',
      keywords: ['favicon generator', 'create favicon', 'ico converter', 'apple touch icon generator', 'website icon maker'],
    },
    features: [
      'Auto-generate all standard sizes',
      'Support for PNG, JPG, and SVG',
      'ZIP download of all icons',
      'Instant preview grid',
      'High-quality resampling'
    ],
    benefits: [
      'Professional website appearance',
      'Better user recognition in tabs',
      'Support for all devices and browsers'
    ],
    useCases: [
      'Web developers setting up new sites',
      'Branding updates',
      'App icon creation'
    ],
    faqs: [
      {
        question: 'What sizes are generated?',
        answer: 'We generate 16x16, 32x32, 48x48, 64x64, and 180x180 (Apple Touch Icon) sizes.'
      }
    ],
    longContent: 'A favicon is a small but vital part of your website\'s identity. It helps users identify your site among many open tabs and provides a professional touch to your branding. Our <a href="/tools/favicon-generator" class="underline hover:text-blue-200">favicon generator</a> takes the hassle out of creating multiple icon sizes. Just upload your logo, and we\'ll handle the rest, providing you with a ready-to-use ZIP file containing all the necessary formats.'
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    title: 'Precise Age Calculator',
    description: 'Calculate your exact age in years, months, days, and even seconds.',
    icon: 'Calendar',
    slug: 'age-calculator',
    category: 'misc',
    isNew: true,
    seo: {
      title: 'Free Online Age Calculator - Find Your Exact Age',
      description: 'Calculate your exact age from your date of birth. Get results in years, months, days, hours, and seconds. See your next birthday countdown.',
      keywords: ['age calculator', 'calculate age', 'how old am i', 'birthday calculator', 'age in days'],
    },
    features: [
      'Years, months, and days breakdown',
      'Total days, weeks, and hours',
      'Next birthday countdown',
      'Time of birth support',
      'Live updates'
    ],
    benefits: [
      'Know your exact age',
      'Plan for upcoming birthdays',
      'Fun facts about your life duration'
    ],
    useCases: [
      'Filling out forms',
      'Checking age requirements',
      'Curiosity and fun'
    ],
    faqs: [
      {
        question: 'Is the calculation accurate?',
        answer: 'Yes, our calculator accounts for leap years and varying month lengths to give you the most precise result possible.'
      }
    ],
    longContent: 'Ever wondered exactly how many seconds you\'ve been alive? Our <a href="/tools/age-calculator" class="underline hover:text-blue-200">age calculator</a> provides a detailed breakdown of your life duration. Beyond just years and months, you can see your age in weeks, days, hours, and even minutes. It also features a live countdown to your next birthday, so you can start the celebration early!'
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    title: 'Convert Images to PDF',
    description: 'Convert multiple images into a single PDF document instantly.',
    icon: 'FileText',
    slug: 'image-to-pdf',
    category: 'convert',
    isNew: true,
    seo: {
      title: 'Free Online Image to PDF Converter - Convert JPG, PNG to PDF',
      description: 'Convert your images to PDF online for free. Support for JPG, PNG, and WebP. Reorder images, set page size, and orientation. 100% secure and client-side.',
      keywords: ['image to pdf', 'convert jpg to pdf', 'png to pdf', 'online pdf maker', 'images to pdf'],
    },
    features: [
      'Drag & drop reordering',
      'Custom page sizes (A4, Letter)',
      'Portrait & Landscape orientation',
      'Image quality control',
      'Instant PDF preview'
    ],
    benefits: [
      'Combine multiple images into one file',
      'Professional document creation',
      'Secure client-side processing'
    ],
    useCases: [
      'Creating digital portfolios',
      'Scanning documents with phone',
      'Combining screenshots into a report'
    ],
    faqs: [
      {
        question: 'Are my images uploaded to a server?',
        answer: 'No, all processing happens locally in your browser. Your images never leave your device.'
      }
    ],
    longContent: 'Convert your photos and graphics into professional PDF documents with our <a href="/tools/image-to-pdf" class="underline hover:text-blue-200">Image to PDF converter</a>. Whether you need to combine several JPGs into a single report or create a digital portfolio from your PNG designs, our tool offers the flexibility you need. You can reorder images, choose page orientations, and adjust quality settings to get the perfect result every time.'
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    title: 'Merge Multiple PDF Files',
    description: 'Combine two or more PDF files into a single document.',
    icon: 'Combine',
    slug: 'merge-pdf',
    category: 'edit',
    isNew: true,
    seo: {
      title: 'Free Online PDF Merger - Combine PDF Files Instantly',
      description: 'Merge multiple PDF files into one online for free. Easy drag-and-drop reordering. Fast, secure, and works entirely in your browser.',
      keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'pdf merger online', 'free pdf tools'],
    },
    features: [
      'Combine unlimited PDF files',
      'Drag & drop to reorder',
      'File metadata preview',
      'Fast merging logic',
      'Secure local processing'
    ],
    benefits: [
      'Organize your documents better',
      'Reduce file clutter',
      'Easy to share single files'
    ],
    useCases: [
      'Combining monthly reports',
      'Joining separate chapters of a book',
      'Merging signed documents'
    ],
    faqs: [
      {
        question: 'Is there a file size limit?',
        answer: 'The limit depends on your browser\'s memory, but typically you can merge files up to several hundred MBs.'
      }
    ],
    longContent: 'Simplify your document management by using our <a href="/tools/merge-pdf" class="underline hover:text-blue-200">Merge PDF tool</a>. Instead of sending multiple separate attachments, you can combine them into one cohesive document. Our tool allows you to easily reorder files before merging, ensuring your final PDF is perfectly organized. Everything happens on your computer, so your sensitive documents remain private.'
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    title: 'Split PDF Pages',
    description: 'Extract specific pages from a PDF or split it into separate files.',
    icon: 'Scissors',
    slug: 'split-pdf',
    category: 'edit',
    isNew: true,
    seo: {
      title: 'Free Online PDF Splitter - Extract Pages from PDF',
      description: 'Split your PDF files online for free. Extract specific page ranges or individual pages easily. Fast and secure client-side processing.',
      keywords: ['split pdf', 'extract pages from pdf', 'pdf splitter online', 'separate pdf pages', 'free pdf tools'],
    },
    features: [
      'Extract page ranges',
      'Individual page selection',
      'Thumbnail preview of pages',
      'Fast extraction logic',
      'Privacy-focused processing'
    ],
    benefits: [
      'Extract only what you need',
      'Reduce file size by removing pages',
      'Easy to manage large documents'
    ],
    useCases: [
      'Extracting a single chapter from a book',
      'Removing unnecessary pages from a report',
      'Splitting a large document for easier sharing'
    ],
    faqs: [
      {
        question: 'Can I split a password-protected PDF?',
        answer: 'Currently, you need to remove the password before splitting. We prioritize security and do not store or process passwords.'
      }
    ],
    longContent: 'Need only a few pages from a massive PDF? Our <a href="/tools/split-pdf" class="underline hover:text-blue-200">Split PDF tool</a> is here to help. You can specify exact page ranges or select individual pages to extract into a new document. This is perfect for reducing file sizes or isolating specific information for sharing. Like all Sohelix tools, your data stays on your device throughout the entire process.'
  }
];
