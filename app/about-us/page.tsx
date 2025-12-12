import Image from "next/image";

export default function AboutUsPage() {
    return (
        <>
            <h1 className="h5 text-secondary mx-5">About TripTally</h1>
            <h2 className="h1 my-4 mx-5">The Intelligent Companion Designed for Smarter, Stress-Free Travel</h2>

            <div className="d-flex flex-column flex-md-row align-items-center justify-content-center">
                <img
                    src="/about-us/travel-1.jpg"
                    alt="travel drawing"
                    className="img-fluid mb-3 mb-md-0 me-md-3"
                    style={{ maxWidth: "18rem", width: "100%" }}
                />

                <div style={{ maxWidth: "35rem" }} className="d-flex flex-column gap-3">
                    <p>
                        If you are here, you probably love traveling — the discovery, the food, the spontaneity,
                        the feeling of landing somewhere new.
                    </p>
                    <p className="text-primary">
                        <strong>But there’s another side of travel that isn’t quite as glamorous...</strong>
                    </p>
                </div>
            </div>

            <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-3">
                <div style={{ maxWidth: "35rem" }} className="d-flex flex-column gap-3">
                    <p className="m-0">
                        Picture this: you’re planning a trip, and suddenly your screen turns into a patchwork of tabs,
                        screenshots, and half-written notes. Your hotel confirmation is in your inbox, the budget is in
                        a spreadsheet you forgot to update, your packing list lives in your notes app…
                        and the weather forecast? Somewhere between yesterday’s search history and your group chat.
                    </p>
                </div>
                <img
                    src="/about-us/travel-2.png"
                    alt="travel drawing"
                    className="img-fluid mb-3 mb-md-0 me-md-3"
                    style={{ maxWidth: "15rem", width: "100%" }}
                />
            </div>

            <div className="d-flex flex-column flex-md-row align-items-center justify-content-center">
                <img
                    src="/about-us/travel-3.jpg"
                    alt="travel drawing"
                    className="img-fluid mb-3 mb-md-0 me-md-3"
                    style={{ maxWidth: "14rem", width: "100%" }}
                />

                <div style={{ maxWidth: "35rem" }} className="d-flex flex-column gap-3">
                    <p>
                        For years, travel tools have done one thing each, really well… in isolation.
                        A great flight tracker here. A decent expense app there. A random packing list generator
                        that ignores whether you’re going to Iceland in December or Bali in July.
                    </p>
                </div>
            </div>

            <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-3">
                <div style={{ maxWidth: "35rem" }} className="d-flex flex-column gap-3">
                    <p className="m-0">
                        We wanted a travel tool that didn’t just store information… but <strong>understood</strong> it.
                        One that didn’t just list your plans… but supported them.
                        Something that could do more than passively hold your itinerary - it should anticipate, adapt, and guide.
                    </p>
                </div>
                <img
                    src="/about-us/travel-4.png"
                    alt="travel drawing"
                    className="img-fluid mb-3 mb-md-0 me-md-3"
                    style={{ maxWidth: "15rem", width: "100%" }}
                />
            </div>

            <div className="d-flex flex-column flex-md-row align-items-center justify-content-center">
                <img
                    src="/about-us/travel-5.jpg"
                    alt="travel drawing"
                    className="img-fluid mb-3 mb-md-0 me-md-3"
                    style={{ maxWidth: "13rem", width: "100%" }}
                />

                <div style={{ maxWidth: "35rem" }} className="d-flex flex-column gap-3">
                    <p>
                        Wherever you’re going next, we’re here to help you get there with clarity,
                        confidence, and maybe a little extra breathing room in your day.
                    </p>
                </div>
            </div>

            <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-3 my-5">
                <p className="text-primary align-items-center text-center fs-5" style={{ maxWidth: "35rem" }}>
                    <strong>
                        TripTally is for people who want to spend less time managing logistics and{" "}
                        more time enjoying the journey.
                    </strong>
                </p>
            </div>

        </>
    )
}