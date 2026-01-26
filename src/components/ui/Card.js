/*
  Card Component

  A simple container component for grouping related content.

  WHY COMPONENTS FOR SIMPLE THINGS?
  Even "simple" components provide value:
  1. Consistent border-radius, shadow, padding across the app
  2. Easy to update all cards at once if design changes
  3. Can add features later (like hover effects) in one place

  ACCESSIBILITY:
  - Can render as semantic elements (section, article) via 'as' prop

  USAGE:
  <Card>Content here</Card>
  <Card className="hover:shadow-lg">Hoverable card</Card>
  <Card as="section">Semantic section</Card>
*/

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.as - Element type to render (div, section, article)
 */
export default function Card({ children, className = '', as: Component = 'div', ...props }) {
  return (
    <Component
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200 p-6
        dark:bg-gray-800 dark:border-gray-700
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
}
