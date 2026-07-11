export interface ReverseGeocodeResult {
    country?: string;
    province?: string;
    city?: string;
    district?: string;
    description?: string;
}

interface NominatimAddress {
    country?: string;
    state?: string;
    province?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    city_district?: string;
    district?: string;
    suburb?: string;
    road?: string;
    pedestrian?: string;
    footway?: string;
    building?: string;
    amenity?: string;
}

interface NominatimReverseResponse {
    display_name?: string;
    address?: NominatimAddress;
}

function compact(parts: Array<string | undefined>) {
    return parts
        .map((item) => item?.trim())
        .filter((item): item is string => Boolean(item));
}

export async function reverseGeocode(lat: number, lon: number, timeoutMs = 7000): Promise<ReverseGeocodeResult | null> {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
    url.searchParams.set("zoom", "18");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("accept-language", "zh-CN,zh,en");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url.toString(), {
            headers: {
                Accept: "application/json",
            },
            signal: controller.signal,
        });
        if (!response.ok) return null;

        const data = await response.json() as NominatimReverseResponse;
        const address = data.address;
        if (!address) return null;

        const city = address.city || address.town || address.village || address.county;
        const district = address.city_district || address.district || address.suburb || address.county;
        const placeDescription = compact([
            district,
            address.road || address.pedestrian || address.footway,
            address.building || address.amenity,
        ]).join(" ");

        return {
            country: address.country,
            province: address.state || address.province,
            city,
            district,
            description: placeDescription || data.display_name,
        };
    } finally {
        window.clearTimeout(timeout);
    }
}
