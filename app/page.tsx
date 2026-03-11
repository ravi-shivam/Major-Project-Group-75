import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionsList";
import CTA from "@/components/CTA";
import {getAllCompanions, getRecentSessions} from "@/lib/actions/companion.actions";
import {getSubjectColor} from "@/lib/utils";

const Page = async () => {
    let companions: Companion[] = [];
    let recentSessionsCompanions: Companion[] = [];

    try {
        companions = await getAllCompanions({ limit: 3 });
    } catch (e) {
        console.error("Failed to load companions:", e);
    }

    try {
        recentSessionsCompanions = await getRecentSessions(10);
    } catch (e) {
        console.error("Failed to load recent sessions:", e);
    }

  return (
    <main>
      <h1>Popular Companions</h1>

        <section className="home-section">
            {companions.map((companion) => (
                <CompanionCard
                    key={companion.id}
                    {...companion}
                    color={getSubjectColor(companion.subject)}
                />
            ))}

        </section>

        <section className="home-section">
            <CompanionsList
                title="Recently completed sessions"
                companions={recentSessionsCompanions}
                classNames="w-2/3 max-lg:w-full"
            />
            <CTA />
        </section>
    </main>
  )
}

export default Page
