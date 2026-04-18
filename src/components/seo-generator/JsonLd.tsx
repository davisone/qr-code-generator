interface Props {
  data: unknown;
}

/**
 * Injecte un bloc JSON-LD structured data.
 * Le contenu est sérialisé côté serveur et ne contient jamais d'input utilisateur —
 * les données proviennent uniquement des fichiers de traduction et de config.
 */
export const JsonLd = ({ data }: Props) => {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // safe: contenu serveur, sérialisé avec échappement du caractère '<'
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
};
