function LoadingIndicator({ label = 'Cargando...', compact = false }) {
  return (
    <span role="status" className={`inline-flex items-center justify-center gap-2 ${compact ? '' : 'py-2'}`}>
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
      />
      <span>{label}</span>
    </span>
  );
}

export default LoadingIndicator;
