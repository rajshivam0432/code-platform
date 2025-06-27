import { useEffect } from "react";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css"; // You can choose a different theme if you prefer
import "./AIReview.css"; // Optional: Your custom styles

const AIReview = ({ reviewData }) => {
  const sections = reviewData.review.split("---").filter(Boolean);

  useEffect(() => {
    hljs.highlightAll();
  }, [reviewData]);

  return (
    <div className="p-4 bg-gray-100 rounded-md">
      <h2 className="text-2xl font-bold mb-4">💡 AI Code Review</h2>
      {sections.map((section, index) => (
        <div
          key={index}
          className="bg-white shadow-md p-4 mb-4 rounded-md prose max-w-none"
          dangerouslySetInnerHTML={{ __html: marked.parse(section.trim()) }}
        />
      ))}
    </div>
  );
};

export default AIReview;
