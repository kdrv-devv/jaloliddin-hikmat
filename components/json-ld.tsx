/**
 * Schema.org ma'lumotlarini sahifaga qo'yadi.
 *
 * `<` belgisi ekranlanadi: yozuv matnida tasodifan `</script>` uchrasa ham
 * sahifa buzilmaydi.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
