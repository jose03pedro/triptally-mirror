import Image from "next/image";
import Icon from "@/app/components/ui/icon";

export default function ContactPage() {
    return (
        <>
            <div className="position-relative mb-4">
                <div className="position-relative" style={{ height: "400px", width: "100vw" }}>
                    <Image
                        src={`/contacts/banner.jpg`}
                        alt="Contacts banner"
                        className="pointer-events-none"
                        fill
                        style={{ objectFit: "cover" }}
                    />
                </div>

                <div className="position-absolute top-50 start-50 translate-middle text-center text-white">
                    <h2 className="text-primary">CONTACTS</h2>
                    <p>Get in touch with our team for any questions, support, or feedback.</p>
                </div>
            </div>

            <section>
                <div className="d-flex flex-column align-items-center">
                    <Icon icon="mail" type="outlined" color="#0d6efd" size={40}/>
                    <h3 className="my-3" style={{ fontSize: "1.3rem"}}><strong>EMAIL US</strong></h3>
                    <p style={{ maxWidth: "200px"}} className="text-center">Send us an email, and we’ll reply as soon as possible.</p>
                    <p style={{ color: "#0d6efd"}}><strong>example@test.com</strong></p>
                </div>
            </section>
        </>
    )
}