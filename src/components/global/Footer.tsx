export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground py-8 mt-12 border-t border-border">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Miçangueria. Todos os direitos reservados.</p>
        <p className="text-sm mt-2">Inspirado na cultura, feito com amor.</p>
      </div>
    </footer>
  );
}
