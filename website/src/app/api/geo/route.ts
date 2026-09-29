import { NextResponse } from "next/server";
import { City, Country, State } from "country-state-city";

/**
 * Location lookups for address dropdowns. Data stays on the server; the browser
 * only receives the list it needs.
 *   /api/geo                       -> countries
 *   /api/geo?country=IN            -> states
 *   /api/geo?country=IN&state=CT   -> cities
 *   /api/geo?pincode=495006        -> { city, state, country } (India PIN lookup)
 */
export const dynamic = "force-dynamic";

const cache = { headers: { "Cache-Control": "public, max-age=86400" } };

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const country = params.get("country")?.toUpperCase();
  const state = params.get("state")?.toUpperCase();
  const pincode = params.get("pincode");

  if (pincode) {
    if (!/^\d{6}$/.test(pincode)) return NextResponse.json({ found: false });
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
        signal: AbortSignal.timeout(6000),
        next: { revalidate: 86400 },
      });
      const body = (await res.json()) as Array<{
        Status: string;
        PostOffice?: Array<{ District: string; State: string; Country: string }> | null;
      }>;
      const office = body?.[0]?.Status === "Success" ? body[0].PostOffice?.[0] : undefined;
      if (!office) return NextResponse.json({ found: false });
      // India Post spellings differ slightly ("Chattisgarh", "Bilaspur(CGH)"): map them
      // onto the dropdown's names so the selects stay linked.
      const loose = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "").replace(/h/g, "");
      const stateMatch = State.getStatesOfCountry("IN").find(
        (s) => loose(s.name) === loose(office.State),
      );
      const district = office.District.replace(/\s*\(.*\)\s*$/, "").trim();
      const cityMatch = stateMatch
        ? City.getCitiesOfState("IN", stateMatch.isoCode).find(
            (c) => loose(c.name) === loose(district),
          )
        : undefined;
      return NextResponse.json(
        {
          found: true,
          city: cityMatch?.name ?? district,
          state: stateMatch?.name ?? office.State,
          country: "India",
        },
        cache,
      );
    } catch {
      return NextResponse.json({ found: false });
    }
  }

  if (country && state) {
    const names = [...new Set(City.getCitiesOfState(country, state).map((c) => c.name))];
    return NextResponse.json({ items: names.map((n) => ({ code: n, name: n })) }, cache);
  }
  if (country) {
    return NextResponse.json(
      { items: State.getStatesOfCountry(country).map((s) => ({ code: s.isoCode, name: s.name })) },
      cache,
    );
  }
  return NextResponse.json(
    { items: Country.getAllCountries().map((c) => ({ code: c.isoCode, name: c.name })) },
    cache,
  );
}
