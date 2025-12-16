import Image from "next/image";
import Icon from "@/app/components/ui/Icon";

export default function ContactPage() {
    return (
        <>
            <div className="position-relative mb-4">
                <div className="position-relative" style={{ height: "400px", width: "100vw" }}>

                    {/* Background Image */}
                    <Image
                        src={`/contacts/banner.jpeg`}
                        alt="Contacts banner"
                        className="pointer-events-none"
                        fill
                        style={{ objectFit: "cover" }}
                    />

                    {/* Overlay */}
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{ backgroundColor: "rgba(0, 0, 0, 0.40)" }}
                    />
                </div>

                {/* Text Content */}
                <div className="position-absolute start-50 top-50 translate-middle-x text-center text-white">
                    <h2 className="text-primary"><strong>CONTACTS</strong></h2>
                    <p className="mt-2">
                        Get in touch with our team for any questions, support, or feedback.
                    </p>
                </div>
            </div>


            <section>
                <div className="d-flex flex-column align-items-center">
                    <Icon icon="mail" type="outlined" color="#0d6efd" size={40}/>
                    <h3 className="my-3" style={{ fontSize: "1.3rem"}}>
                        <strong>EMAIL US</strong>
                    </h3>
                    <p style={{ maxWidth: "200px"}} className="text-center">
                        Send us an email, and we’ll reply as soon as possible.
                    </p>
                    <a
                        href="mailto:triptallyemails@gmail.com"
                        className="text-primary fw-bold text-decoration-none"
                    >
                        triptallyemails@gmail.com
                    </a>
                </div>
            </section>
        </>
    )
}