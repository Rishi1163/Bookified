"use client"
import { cn } from '@/lib/utils'
import { Show, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const navItems = [
    { label: "Library", href: "/" },
    { label: "Add New", href: "/books/new" }
]

const Navbar = () => {

    const pathname = usePathname()
    const { user } = useUser()

    return (
        <header className="w-full fixed z-50 bg-[var(--bg-primary)] ">
            <div className="wrapper navbar-height py-4 flex justify-between items-center">
                <Link href={'/'} className='flex gap-0.5 items-center'>
                    <Image
                        src={'/assets/logo.png'}
                        className='rounded'
                        width={42}
                        height={26}
                        style={{ height: 'auto' }}
                        alt='Bookified'
                    />
                    <span className='logo-text'>Bookified</span>
                </Link>
                <nav className='w-fit flex gap-7.5 items-center'>
                    {navItems.map(({ label, href }) => {
                        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

                        return (
                            <Link className={cn('nav-link-base', isActive ? "nav-link-active" : "text-black hover:opacity-70")} href={href} key={label}>
                                {label}
                            </Link>
                        )
                    })}

                    <div className='flex gap-7.7 items-center'>
                        <Show when="signed-out">
                            <SignInButton />
                        </Show>
                        <Show when="signed-in">
                            <div className='nav-user-link'>
                                <UserButton />
                                {user?.firstName && (
                                    <Link className='nav-user-name' href={'/subscriptions'}>
                                        {user.firstName}
                                    </Link>
                                )}
                            </div>
                        </Show>
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Navbar