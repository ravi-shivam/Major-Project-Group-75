import React from 'react'
import {Button} from "@/components/ui/button";
import CompanionCard from "@/components/CompanionCard";

const Page = () => {
  return (
    <div>
        <h1 className="text-2xl underline">Popular Companions</h1>

        <section className="home-section">
            <CompanionCard />
        </section>
    </div>

  )
}

export default Page