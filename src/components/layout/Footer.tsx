export function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-6">
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} m4capital. All rights reserved.</p>
                <div className="flex justify-center space-x-4 mt-4">
                    <a href="#" className="hover:text-indigo-400">Privacy Policy</a>
                    <a href="#" className="hover:text-indigo-400">Terms of Service</a>
                    <a href="#" className="hover:text-indigo-400">Contact</a>
                </div>
            </div>
        </footer>
    )
}