export default async function handler(req, res) {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://desidera-production.up.railway.app';
    
    const response = await fetch(`${API_BASE}/api/menu`, {
      cache: 'no-store'
    });
    
    const data = await response.json();
    
    res.status(200).json({
      apiBase: API_BASE,
      status: response.status,
      itemCount: data.items ? data.items.length : 0,
      items: data.items || []
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      apiBase: process.env.NEXT_PUBLIC_API_BASE_URL 
    });
  }
}
