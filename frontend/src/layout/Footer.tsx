export const Footer = () => {
    return (
        <footer className="w-full border-t border-gray-200 bg-white py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} FormDealer. Усі права захищено.
            </div>
        </footer>
    );
};