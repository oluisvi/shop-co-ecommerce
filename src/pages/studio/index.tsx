import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, type FormEvent } from 'react';
import SiteHead from '@/components/SiteHead';
import { useAuth } from '@/context/AuthContext';
import { adjustStudioInventory, archiveStudioProduct, createStudioProduct, getStudioCategories, getStudioDashboard, getStudioOrders, getStudioProducts, updateStudioOrderStatus, updateStudioProduct, uploadStudioImage, type StudioCategory, type StudioDashboard, type StudioOrder, type StudioProduct } from '@/lib/api/studio';
import { buildStudioProductUpdate, getNextFulfillmentStatus } from '@/lib/studio-ui';

export default function StudioPage() {
  const router = useRouter(); const { user, accessToken, loading, role, profileLoading, signOut } = useAuth();
  const [dashboard, setDashboard] = useState<StudioDashboard | null>(null); const [categories, setCategories] = useState<StudioCategory[]>([]);
  const [products, setProducts] = useState<StudioProduct[]>([]); const [orders, setOrders] = useState<StudioOrder[]>([]);
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const [studioLoading, setStudioLoading] = useState(true);
  useEffect(() => { if (!loading && !user) void router.replace('/auth/sign-in'); }, [loading, user, router]);
  useEffect(() => { if (!loading && !profileLoading && user && role !== 'SELLER') void router.replace('/account'); }, [loading, profileLoading, user, role, router]);
  useEffect(() => { if (!accessToken) return; let active = true; void Promise.all([getStudioDashboard(accessToken), getStudioCategories(accessToken), getStudioProducts(accessToken), getStudioOrders(accessToken)])
    .then(([data, nextCategories, nextProducts, nextOrders]) => { if (active) { setDashboard(data); setCategories(nextCategories); setProducts(nextProducts); setOrders(nextOrders); } })
    .catch(() => { if (active) setMessage('Seller access is required, or the Studio API is unavailable.'); })
    .finally(() => { if (active) setStudioLoading(false); }); return () => { active = false; }; }, [accessToken]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!accessToken) return; setBusy(true); setMessage('');
    const form = event.currentTarget; const data = new FormData(form); const file = data.get('image');
    try {
      if (!(file instanceof File) || !file.size) throw new Error('Choose a garment image.');
      const uploaded = await uploadStudioImage(accessToken, file);
      await createStudioProduct(accessToken, {
        name: String(data.get('name')), slug: String(data.get('slug')), description: String(data.get('description') || ''),
        categoryId: String(data.get('categoryId')), collection: String(data.get('collection')), cardImage: uploaded.url,
        priceCents: Math.round(Number(data.get('price')) * 100), condition: String(data.get('condition')),
        conditionNotes: String(data.get('conditionNotes') || ''), brand: String(data.get('brand') || ''),
        material: String(data.get('material') || ''), imperfections: String(data.get('imperfections') || ''),
        size: String(data.get('size') || ''), color: String(data.get('color') || ''), published: data.get('published') === 'on',
      });
      form.reset(); setMessage('Piece created. It is now part of the archive.');
      const [nextDashboard, nextProducts] = await Promise.all([getStudioDashboard(accessToken), getStudioProducts(accessToken)]); setDashboard(nextDashboard); setProducts(nextProducts);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'The piece could not be created.'); }
    finally { setBusy(false); }
  };

  if (loading || profileLoading || studioLoading || !user || role !== 'SELLER') return <main className="studio-page"><p role="status">Opening Seller Studio…</p></main>;
  return <main className="studio-page"><SiteHead title="Seller Studio | SHOP.CO" description="Operate the SHOP.CO archive." path="/studio" />
    <header className="studio-header"><Link href="/" className="auth-page__brand">SHOP.CO</Link><div><span>Seller Studio</span><button type="button" onClick={() => void signOut().then(() => router.push('/'))}>Sign out</button></div></header>
    <p className="auth-message" role="status" aria-live="polite">{message}</p>
    {dashboard ? <section className="studio-metrics" aria-label="Store overview">
      <article><strong>{dashboard.activePieces}</strong><span>Active pieces</span></article><article><strong>{dashboard.draftPieces}</strong><span>Drafts</span></article>
      <article><strong>{dashboard.soldOutPieces}</strong><span>Sold out</span></article><article><strong>{dashboard.paidOrders}</strong><span>Paid orders</span></article>
    </section> : null}
    <section className="studio-editor" aria-labelledby="new-piece"><div><p className="eyebrow">Archive intake</p><h1 id="new-piece">Add a garment</h1><p>One sellable variant and one unit are created by default.</p></div>
      <form onSubmit={submit}><label>Piece name<input name="name" maxLength={160} required /></label><label>Slug<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label>
        <label>Description<textarea name="description" maxLength={4000} /></label><label>Category<select name="categoryId" required><option value="">Select</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
        <label>Drop / collection<input name="collection" maxLength={120} required /></label><label>Price (USD)<input name="price" type="number" min="0.01" max="100000" step="0.01" required /></label>
        <label>Condition<select name="condition" required><option value="EXCELLENT">Excellent</option><option value="NEW_WITH_TAGS">New with tags</option><option value="GOOD">Good</option><option value="FAIR">Fair</option></select></label>
        <label>Condition notes<textarea name="conditionNotes" maxLength={2000} /></label><label>Brand<input name="brand" maxLength={120} /></label><label>Material<input name="material" maxLength={240} /></label>
        <label>Size<input name="size" maxLength={80} /></label><label>Color<input name="color" maxLength={80} /></label><label>Imperfections<textarea name="imperfections" maxLength={2000} /></label>
        <label>Garment image<input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required /></label><label className="studio-check"><input name="published" type="checkbox" /> Publish immediately</label>
        <button className="primary-action" disabled={busy}>{busy ? 'Saving piece…' : 'Create piece'}</button></form></section>
    <section className="studio-editor" aria-labelledby="pieces"><div><p className="eyebrow">Catalog control</p><h2 id="pieces">Pieces</h2><p>Adjust physical stock or preserve a piece by archiving it.</p></div><div className="studio-list">
      {products.length ? products.map((product) => { const variant = product.variants[0]; return <article key={product.id}><form onSubmit={(event) => { event.preventDefault(); if (!variant) return; const data = new FormData(event.currentTarget); try { const input = buildStudioProductUpdate({ name: String(data.get('name') ?? ''), price: String(data.get('price') ?? ''), published: data.get('published') === 'on' }); void updateStudioProduct(accessToken!, product.id, input).then(async () => { setProducts(await getStudioProducts(accessToken!)); setMessage('Piece updated.'); }).catch((error) => setMessage(error instanceof Error ? error.message : 'Update failed.')); } catch { setMessage('Enter a valid name and price.'); } }}><label>Piece name<input name="name" defaultValue={product.name} maxLength={160} required /></label>{variant ? <label>Price (USD)<input name="price" type="number" min="0.01" max="100000" step="0.01" defaultValue={variant.price} required /></label> : null}<label className="studio-check"><input name="published" type="checkbox" defaultChecked={product.status === 'ACTIVE'} disabled={product.status === 'ARCHIVED'} /> Published</label><button type="submit" disabled={!variant || product.status === 'ARCHIVED'}>Save piece</button></form><div><span>{product.status} · {variant?.inventory?.reservedQuantity ?? 0} reserved</span></div>{variant ? <label>Physical stock<input aria-label={`${product.name} physical stock`} type="number" min={variant.inventory?.reservedQuantity ?? 0} defaultValue={variant.inventory?.quantity ?? 0} onBlur={(event) => void adjustStudioInventory(accessToken!, variant.id, Number(event.currentTarget.value)).then(() => setMessage('Inventory updated.')).catch((error) => setMessage(error instanceof Error ? error.message : 'Inventory update failed.'))} /></label> : null}<button type="button" disabled={product.status === 'ARCHIVED'} onClick={() => void archiveStudioProduct(accessToken!, product.id).then(async () => { setProducts(await getStudioProducts(accessToken!)); setMessage('Piece archived.'); }).catch((error) => setMessage(error instanceof Error ? error.message : 'Archive failed.'))}>Archive</button></article>; }) : <p>No pieces yet. Add the first garment to begin the archive.</p>}
    </div></section>
    <section className="studio-editor" aria-labelledby="orders"><div><p className="eyebrow">Fulfillment</p><h2 id="orders">Orders</h2><p>Only legal forward status transitions are accepted by the API.</p></div><div className="studio-list">
      {orders.length ? orders.map((order) => { const nextStatus = getNextFulfillmentStatus(order.status); return <article key={order.orderNumber}><div><strong>{order.orderNumber}</strong><span>{order.status} · {order.currency} {order.total} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)</span></div>{nextStatus ? <button type="button" onClick={() => void updateStudioOrderStatus(accessToken!, order.orderNumber, nextStatus).then(async () => { setOrders(await getStudioOrders(accessToken!)); setMessage('Order status updated.'); }).catch((error) => setMessage(error instanceof Error ? error.message : 'Status update failed.'))}>Mark as {nextStatus.toLowerCase()}</button> : <span>No fulfillment action available</span>}</article>; }) : <p>No orders yet.</p>}
    </div></section>
  </main>;
}
