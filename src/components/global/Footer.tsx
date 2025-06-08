export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-8 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Miçangueria. All rights reserved.</p>
        <p className="text-sm mt-2">Inspired by culture, crafted with love.</p>
      </div>
    </footer>
  );
}
