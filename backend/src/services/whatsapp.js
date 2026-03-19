function buildWhatsAppLink(phoneNumber, message) {
  const digits = String(phoneNumber || '').replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${encoded}`;
}

module.exports = { buildWhatsAppLink };
