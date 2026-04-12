import { Card, CardBody } from "@heroui/react";
import { Heart, Users, Calendar, Globe } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: <Calendar size={32} />,
      title: "Event Discovery",
      description: "We help people find the best events happening around them, from local meetups to large-scale conferences.",
    },
    {
      icon: <Users size={32} />,
      title: "Community",
      description: "Building connections between event organizers and attendees to create memorable experiences.",
    },
    {
      icon: <Globe size={32} />,
      title: "Accessibility",
      description: "Making event discovery and booking accessible to everyone, everywhere.",
    },
    {
      icon: <Heart size={32} />,
      title: "Passion",
      description: "We are passionate about bringing people together through shared experiences and events.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">About Eventide</h1>
        <p className="text-lg text-default-500 max-w-2xl mx-auto">
          Eventide is a modern event discovery and booking platform that connects people
          with amazing experiences. Whether you are an organizer looking to reach a wider
          audience or someone searching for your next great event, we have got you covered.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {values.map((item) => (
          <Card key={item.title} className="border border-default-200">
            <CardBody className="flex flex-row gap-4 p-6">
              <div className="text-primary flex-shrink-0">{item.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-default-500 text-sm">{item.description}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="bg-primary-50 dark:bg-primary-900/20 border-none">
        <CardBody className="p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Our Mission</h2>
          <p className="text-default-600 max-w-2xl mx-auto">
            To make event discovery effortless and event management seamless. We believe
            that great events bring people together and create lasting memories. Our platform
            empowers organizers with the tools they need while giving users the best
            experience in finding and booking events.
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default About;
