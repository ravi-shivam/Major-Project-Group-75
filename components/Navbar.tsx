import Link from "next/link";
import Image from "next/image";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Navitems from "./Navitems";

const Navbar = async () => {
    const { userId } = await auth();
    return (
        <nav className="navbar">
            <Link href="/">
                <div className="flex items-center gap-2.5 cursor-pointer">
                    <Image
                        src="/images/logo.svg"
                        alt="Logo"
                        width={102}
                        height={100}
                    />
                </div>
            </Link>
            <div className="flex items-center gap-8">
                <Navitems />
                {!userId && (
                    <SignInButton>
                        <button className="btn-signin">Sign In</button>
                    </SignInButton>
                )}
                {userId && <UserButton />}
            </div>
        </nav>
    )
}

export default Navbar