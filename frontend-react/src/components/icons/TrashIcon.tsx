import { type SVGProps } from "react";

function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15.763 9H7.637a.823.823 0 0 0-.812.833V16.5c0 1.38 1.091 2.5 2.438 2.5h4.874c.647 0 1.267-.263 1.724-.732a2.533 2.533 0 0 0 .714-1.768V9.833A.823.823 0 0 0 15.763 9ZM14.625 7l-.103-.21A3.148 3.148 0 0 0 11.7 5a3.148 3.148 0 0 0-2.823 1.79L8.775 7h5.85Z"
        clipRule="evenodd"
      />
      <path
        fill="currentColor"
        d="M10.825 12.333a.75.75 0 0 0-1.5 0h1.5Zm-1.5 3.333a.75.75 0 0 0 1.5 0h-1.5Zm4.75-3.333a.75.75 0 1 0-1.5 0h1.5Zm-1.5 3.333a.75.75 0 0 0 1.5 0h-1.5Zm2.05-9.416a.75.75 0 0 0 0 1.5v-1.5Zm1.95 1.5a.75.75 0 0 0 0-1.5v1.5Zm-7.8 0a.75.75 0 1 0 0-1.5v1.5Zm-1.95-1.5a.75.75 0 0 0 0 1.5v-1.5Zm2.5 6.083v3.333h1.5v-3.333h-1.5Zm3.25 0v3.333h1.5v-3.333h-1.5Zm2.05-4.583h1.95v-1.5h-1.95v1.5Zm-5.85-1.5h-1.95v1.5h1.95v-1.5Z"
      />
    </svg>
  )
}
export default TrashIcon
