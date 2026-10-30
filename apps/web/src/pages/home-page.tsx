import { SearchForm } from "../components/search-form";

/** Landing page with the hero and the stay search. */
export function HomePage() {
  return (
    <main>
      <section className="bg-forest px-6 py-20 text-cream">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-serif text-5xl">Hotel Rheinblick</h1>
          <p className="mt-3 max-w-xl text-lg">A quiet boutique hotel on the banks of the Rhine, in the heart of Basel.</p>
        </div>
      </section>
      <section className="mx-auto -mt-8 max-w-5xl px-6">
        <SearchForm />
      </section>
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="font-serif text-2xl">Stay with us</h2>
        <p className="mt-2 max-w-2xl">
          Ten rooms and suites, a breakfast room overlooking the river and the old town at your doorstep.
        </p>
      </section>
    </main>
  );
}
