import { createClient } from "@sanity/client";

export const sanityClient = createClient({
  projectId: "mr60agpk",
  dataset: "production",
  apiVersion: "2023-05-03",
  useCdn: true,
});
