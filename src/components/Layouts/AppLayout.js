import Navigation from '@/components/Layouts/Navigation'
import { useAuth } from '@/hooks/auth'

const AppLayout = ({ header, children }) => {
    const { user } = useAuth({ middleware: 'auth' })

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col dark:bg-gray-900">
            <Navigation user={user} />

            {/* Page Heading */}
            <header className="bg-white shadow dark:bg-gray-800">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-300 text-xl">
                    {header}
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto text-gray-800 dark:text-gray-300">
                {children}
            </main>
        </div>
    )
}

export default AppLayout
