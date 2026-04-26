export default function NewDesignPage() {
  return (
    <iframe
      src="/new-design/index.html"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        zIndex: 9999,
      }}
    />
  )
}
