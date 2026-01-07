import { twMerge } from "tailwind-merge";

export default function Table({ headers, children, className }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className={twMerge("min-w-full divide-y divide-gray-200", className)}>
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
      </table>
    </div>
  );
}

Table.Row = function TableRow({ children, className }) {
  return <tr className={twMerge("hover:bg-gray-50 transition-colors", className)}>{children}</tr>;
};

Table.Cell = function TableCell({ children, className, colSpan }) {
  return (
    <td className={twMerge("px-6 py-4 whitespace-nowrap text-sm text-gray-500", className)} colSpan={colSpan}>
      {children}
    </td>
  );
};
