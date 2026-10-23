import Logo from './Logo'

export default function AuthShell({ titulo, subtitulo, children, rodape }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Logo className="mb-8 justify-center" />
        <div className="panel p-6 sm:p-8">
          <h1 className="text-2xl font-bold">{titulo}</h1>
          <p className="mb-6 mt-1 text-sm text-ink-soft">{subtitulo}</p>
          {children}
        </div>
        <p className="mt-5 text-center text-sm text-ink-soft">{rodape}</p>
      </div>
    </div>
  )
}
