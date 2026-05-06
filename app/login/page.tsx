import { login } from './actions'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const error = searchParams.error;

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-zinc-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
          PPL Dashboard
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Inicia sesión para acceder a tus métricas
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900 py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-zinc-800">
          <form className="space-y-6" action={login}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-md">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-zinc-200">
                Correo Electrónico
              </label>
              <div className="mt-2" suppressHydrationWarning>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  suppressHydrationWarning
                  className="block w-full rounded-md border-0 bg-zinc-950 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-zinc-800 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-zinc-200">
                Contraseña
              </label>
              <div className="mt-2" suppressHydrationWarning>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  suppressHydrationWarning
                  className="block w-full rounded-md border-0 bg-zinc-950 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-zinc-800 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors"
              >
                Ingresar
              </button>
            </div>
          </form>
          
        </div>
      </div>
    </div>
  )
}
