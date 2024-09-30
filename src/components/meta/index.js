import Head from "next/head";
import KeywordExtractor from "@/components/others/keyword_extractor";
import { useRouter } from 'next/router';

/**
 * It takes in the title, description, image and metadesc as props and returns the meta tags for the
 * page
 * @returns The return statement is used to return a value from a function.
 */
let MetaHead = ({ title, description, image, metatitle, metadesc }) => {
    let MAX_CHARACTERS = 250;
    let keywords = KeywordExtractor(description);
    let appUrl = process.env.NEXT_PUBLIC_DOMAIN;
    const router = useRouter();
    const path = `${router.pathname}${router.asPath !== router.pathname ? router.asPath : ''}`;

    // Extract the first paragraph using a regular expression
    let firstParagraph = description && description.match(/<p>.*?<\/p>/)?.[0];

    /* Truncating the description to full stop near 250 characters. */
    let fullStopIndex = firstParagraph?.indexOf(".", MAX_CHARACTERS);
    let endIndex =
        fullStopIndex === -1 ? firstParagraph?.length - 1 : fullStopIndex + 1;
    let truncatedContent = firstParagraph
        ? firstParagraph.slice(0, endIndex).replace(/<\/?p>/g, "")
        : description;
        
    let capitalTitle = metatitle ? metatitle[0].toUpperCase() + metatitle.slice(1) : title[0].toUpperCase() + title.slice(1);

    let metadescription = metadesc ? metadesc : truncatedContent;

    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": appUrl,
                name: "Movers",
                url: appUrl,
                legalName: "Blockforce India Private Limited",
                foundingDate: "2021",
                founders: [
                    {
                        "@type": "Person",
                        name: "Rahul Agarwal and Vijay Varma",
                    },
                ],
                sameAs: [
                    "https://twitter.com/simple-blog",
                    "https://www.facebook.com/simple-blog",
                    "https://www.linkedin.com/company/simple-blog/",
                    "https://t.me/Moversofficial",
                    "https://www.instagram.com/simple-blog/",
                    "https://simple-blog.medium.com/",
                    "https://play.google.com/store/apps/details?id=in.simple-blog.app",
                ],
                logo: {
                    "@type": "ImageObject",
                    "@id": appUrl,
                    url: "logo.png",
                    caption: "Movers",
                },
                image: {
                    "@id": appUrl,
                },
            },
            {
                "@type": "WebSite",
                "@id": appUrl,
                url: appUrl,
                name: "Movers",
                publisher: {
                    "@id": appUrl,
                },
            },
            {
                "@type": "ImageObject",
                "@id": appUrl,
                url: appUrl + "/og-image.png",
                width: 200,
                height: 200,
            },
            {
                "@type": "WebPage",
                "@id": appUrl,
                url: appUrl,
                inLanguage: "en",
                name: "Movers",
                description:
                    "Write articles with freedom",
                isPartOf: {
                    "@id": appUrl,
                },
                about: {
                    "@id": "http://localhost:3000/about-us",
                },
                primaryImageOfPage: {
                    "@id": appUrl,
                },
            },
            {
                "@type": "Table",
                about: "Top news Today",
            },
        ],
    };

    return (
        <>
            <Head>
                <title>{capitalTitle}</title>
                <meta charSet="utf-8" />
                <meta name="description" content={metadescription} />
                <meta name="keywords" content={keywords.join(", ")} />
                <meta name="author" content="Movers" />
                <meta name="copyright" content="Movers" />
                <meta name="robots" content="index, follow" />
                <meta name="googlebot" content="index, follow" />
                <meta name="revisit-after" content="1 days" />
                <meta name="theme-color" content="#ffffff" />

                <meta property="og:type" content="website" />
                <meta
                    property="og:image"
                    content={image ? appUrl + image : `${appUrl}/og-image.png`}
                />
                <meta property="og:image:width" content="200" />
                <meta property="og:image:height" content="200" />
                <meta property="og:description" content={metadescription} />
                <meta property="og:title" content={capitalTitle} />
                <meta property="og:url" content={`${appUrl}`} />
                <meta property="twitter:title" content={capitalTitle} />
                <meta property="twitter:site" content="Movers" />
                <meta
                    property="twitter:image"
                    content={image ? appUrl + image : `${appUrl}/og-image.png`}
                />
                <meta
                    property="twitter:image:src"
                    content={image ? appUrl + image : `${appUrl}/og-image.png`}
                />
                <meta property="twitter:card" content="summary_large_image" />

                <meta name="apple-mobile-web-app-title" content="Movers" />
                <meta name="application-name" content="Movers" />
                <meta name="msapplication-TileColor" content="#da532c" />

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="shortcut icon" href={`${appUrl}/favicon.ico`} />
                <link rel="canonical" href={`${appUrl}${path}`} />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Head>
        </>
        
    );
};

export default MetaHead;
