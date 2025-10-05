// Type declarations for CSS imports
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.scss" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.sass" {
  const content: Record<string, string>;
  export default content;
}

// For side-effect imports (like import "./globals.css")
declare module "*.css" {
  const content: string;
  export = content;
}