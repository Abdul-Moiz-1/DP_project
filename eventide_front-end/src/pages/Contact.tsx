import { useState } from "react";
import { Card, CardBody, Input, Textarea, Button } from "@heroui/react";
import { Mail, MapPin, Phone } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
        <p className="text-lg text-default-500 max-w-2xl mx-auto">
          Have questions or feedback? We would love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { icon: <Mail size={24} />, title: "Email", detail: "support@eventide.com" },
          { icon: <Phone size={24} />, title: "Phone", detail: "+1 (555) 123-4567" },
          { icon: <MapPin size={24} />, title: "Address", detail: "123 Event St, City" },
        ].map((item) => (
          <Card key={item.title} className="border border-default-200">
            <CardBody className="flex flex-col items-center text-center p-6 gap-3">
              <div className="text-primary">{item.icon}</div>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="text-default-500 text-sm">{item.detail}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardBody className="p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Send a Message</h2>
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                variant="bordered"
              />
              <Input
                label="Email"
                placeholder="your@email.com"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                variant="bordered"
              />
            </div>
            <Textarea
              label="Message"
              placeholder="How can we help you?"
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              variant="bordered"
              minRows={4}
            />
            <Button color="primary" size="lg" className="self-end">
              Send Message
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Contact;
