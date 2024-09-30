import { Card } from "react-bootstrap";
import React from "react";

const TruncatedContent = ({ content, length }) => {
    const MAX_CHARACTERS = length;

    // Match all paragraphs
    const allParagraphs = content.match(/<p>.*?<\/p>/g) || [""];

    // Filter out paragraphs that only contain whitespace or non-breaking spaces
    const meaningfulParagraphs = allParagraphs.filter(
        (paragraph) => paragraph.replace(/<p>\s*(&nbsp;)*\s*<\/p>/, "") !== ""
    );

    // Take the first one
    const firstParagraph = meaningfulParagraphs[0] || "";

    // Extract text content from firstParagraph
    const textContent = firstParagraph.replace(/<\/?[^>]+(>|$)/g, "");

    // Truncate textContent
    const truncatedText =
        textContent.slice(0, MAX_CHARACTERS) +
        (textContent.length > MAX_CHARACTERS ? "..." : "");

    // Reconstruct HTML for truncated content
    const truncatedContent = `<p>${truncatedText}</p>`;

    return (
        <Card.Text
            as="div"
            dangerouslySetInnerHTML={{ __html: truncatedContent }}
        />
    );
};

export default TruncatedContent;
