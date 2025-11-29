import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link href="/">
                <div className="flex items-center gap-2.5 cursor-pointer">
                    <Image src="/images/logo.svg" alt="Logo" width={58} height={56}/>
                </div>
            </Link>

            <div className="flex items-center gap-8">
                <p>Home</p>
                <p>Companions</p>
                <p>My Profile</p>
                <p>Sign In</p>
            </div>
        </nav>
    )
}

export default Navbar