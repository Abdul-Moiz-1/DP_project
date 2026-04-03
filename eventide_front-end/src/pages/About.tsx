// import { title } from "@/components/primitives";
// import DefaultLayout from "@/layouts/default";

// export default function DocsPage() {
//   return (
//     <DefaultLayout>
//       <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
//         <div className="inline-block max-w-lg text-center justify-center">
//           <h1 className={title()}>About</h1>
//         </div>
//       </section>
//     </DefaultLayout>
//   );
// }




// src/pages/About.tsx
const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold">About Us</h1>
      <p className="mt-4 text-gray-600">Information about EventHub</p>
    </div>
  );
};

export default About;