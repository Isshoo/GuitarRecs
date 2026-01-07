import { twMerge } from "tailwind-merge";

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={twMerge("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className }) {
  return <div className={twMerge("px-6 py-4 border-b border-gray-100", className)}>{children}</div>;
};

Card.Body = function CardBody({ children, className }) {
  return <div className={twMerge("p-6", className)}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className }) {
  return <div className={twMerge("px-6 py-4 bg-gray-50 border-t border-gray-100", className)}>{children}</div>;
};
