import { useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, X, Upload, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ownerStore, restaurantStore, menuStore, categoryStore, getOwnerPlan, maxMenuItems, planHas, fileToBase64, uuid } from '@/store';
import { toast } from 'sonner';
import type { MenuItem, Category } from '@/types';

export default function MenuManagementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const owner = ownerStore.getCurrent();
  const restaurant = id ? restaurantStore.getById(id) : null;

  const [items, setItems] = useState<MenuItem[]>(() => id ? menuStore.getByRestaurant(id) : []);
  const [categories, setCategories] = useState<Category[]>(() => id ? categoryStore.getByRestaurant(id) : []);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showCatDialog, setShowCatDialog] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editCat, setEditCat] = useState<Category | null>(null);

  // Item form state
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemCategory, setItemCategory] = useState('none');
  const [catName, setCatName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!owner || !restaurant) { navigate('/owner/dashboard'); return null; }
  const plan = getOwnerPlan(owner);
  const canAddMore = items.length < maxMenuItems(plan);
  const hasCategories = planHas(plan, 'categories');

  const refresh = useCallback(() => {
    if (id) { setItems(menuStore.getByRestaurant(id)); setCategories(categoryStore.getByRestaurant(id)); }
  }, [id]);

  const openAddItem = () => {
    setEditItem(null); setItemName(''); setItemPrice(''); setItemDesc(''); setItemImage(''); setItemCategory('none');
    setShowItemDialog(true);
  };

  const openEditItem = (item: MenuItem) => {
    setEditItem(item); setItemName(item.name); setItemPrice(String(item.price));
    setItemDesc(item.description || ''); setItemImage(item.image); setItemCategory(item.categoryId || 'none');
    setShowItemDialog(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    setItemImage(await fileToBase64(file));
  };

  const saveItem = () => {
    if (!itemName.trim()) { toast.error('Item name is required'); return; }
    const price = parseFloat(itemPrice);
    if (!itemPrice || isNaN(price) || price < 0) { toast.error('Valid price is required'); return; }
    if (!itemImage && !editItem) { toast.error('Item image is required'); return; }
    if (!canAddMore && !editItem) { toast.error(`Free plan limit: max ${maxMenuItems('free')} items`); return; }

    const m: MenuItem = {
      id: editItem?.id || uuid(),
      restaurantId: restaurant.id,
      categoryId: itemCategory === 'none' ? undefined : itemCategory,
      name: itemName.trim(),
      description: itemDesc.trim() || undefined,
      image: itemImage || editItem?.image || '',
      price,
      createdAt: editItem?.createdAt || new Date().toISOString(),
    };
    menuStore.save(m);
    refresh();
    setShowItemDialog(false);
    toast.success(editItem ? 'Item updated' : 'Item added');
  };

  const deleteItem = (item: MenuItem) => {
    menuStore.delete(item.id);
    refresh();
    toast.success('Item deleted');
  };

  const saveCat = () => {
    if (!catName.trim()) { toast.error('Category name required'); return; }
    categoryStore.save({
      id: editCat?.id || uuid(),
      restaurantId: restaurant.id,
      name: catName.trim(),
      createdAt: editCat?.createdAt || new Date().toISOString(),
    });
    refresh(); setShowCatDialog(false); toast.success(editCat ? 'Category updated' : 'Category added');
  };

  const deleteCat = (cat: Category) => {
    categoryStore.delete(cat.id);
    // unassign items from this category
    menuStore.getByRestaurant(restaurant.id)
      .filter((i) => i.categoryId === cat.id)
      .forEach((i) => menuStore.save({ ...i, categoryId: undefined }));
    refresh();
    toast.success('Category deleted');
  };

  // Group display
  const groups = categories.length > 0
    ? [
        ...categories.map((cat) => ({ label: cat.name, items: items.filter((i) => i.categoryId === cat.id) })),
        { label: 'Uncategorized', items: items.filter((i) => !i.categoryId) },
      ].filter((g) => g.items.length > 0)
    : [{ label: '', items }];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-up">
      <Button variant="ghost" size="sm" className="gap-2 mb-3 -ml-2 rounded-xl" onClick={() => navigate(-1)}>
        <ArrowLeft size={14} strokeWidth={2} /> Back
      </Button>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Menu</h1>
          <p className="text-sm text-muted-foreground">{restaurant.name} · {items.length} items</p>
        </div>
        <div className="flex gap-2">
          {hasCategories ? (
            <Button variant="outline" size="sm" className="gap-1 rounded-xl" onClick={() => { setEditCat(null); setCatName(''); setShowCatDialog(true); }}>
              <Plus size={14} strokeWidth={2} /> Category
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-xl border border-input bg-background px-3 py-1.5 text-sm font-medium opacity-50 cursor-not-allowed select-none" title="Basic plan required">
              <Lock size={12} strokeWidth={2} /> Category
            </span>
          )}
          <Button size="sm" className="gap-1 rounded-xl press-active" onClick={openAddItem} disabled={!canAddMore}>
            <Plus size={14} strokeWidth={2} /> Add Item
          </Button>
        </div>
      </div>

      {!canAddMore && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-sm text-yellow-700 dark:text-yellow-400">
          Free plan limit: {maxMenuItems('free')} items reached.{' '}
          <button className="underline font-medium" onClick={() => navigate('/owner/profile')}>Upgrade</button> for unlimited items.
        </div>
      )}

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-1 border border-border rounded-full px-3 py-1.5 bg-card text-sm">
              {cat.name}
              <button onClick={() => { setEditCat(cat); setCatName(cat.name); setShowCatDialog(true); }} className="ml-1 text-muted-foreground hover:text-foreground transition-colors">
                <Pencil size={11} strokeWidth={2} />
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-muted-foreground hover:text-destructive transition-colors"><X size={11} strokeWidth={2} /></button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                    <AlertDialogDescription>Items will become uncategorized.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteCat(cat)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl animate-fade-in">
          <p className="text-muted-foreground font-medium">No menu items yet</p>
          <Button className="mt-4 rounded-xl press-active" onClick={openAddItem}>Add First Item</Button>
        </div>
      ) : (
        groups.map(({ label, items: groupItems }) => (
          <div key={label} className="mb-6">
            {label && <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-1">{label}</h3>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groupItems.map((item, i) => (
                <Card key={item.id} className={`rounded-2xl border-border/60 hover:shadow-md transition-all duration-200 animate-fade-up stagger-${Math.min(i + 1, 9)}`}>
                  <CardContent className="p-3 flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <span className="font-bold text-muted-foreground">{item.name[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      {item.description && <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>}
                      <p className="text-primary font-bold text-sm mt-0.5">₹{item.price}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => openEditItem(item)}>
                        <Pencil size={13} strokeWidth={2} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-destructive hover:text-destructive"><Trash2 size={13} strokeWidth={2} /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-3xl">
                          <AlertDialogHeader><AlertDialogTitle>Delete item?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteItem(item)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-3xl">
          <DialogHeader><DialogTitle>{editItem ? 'Edit Item' : 'Add Menu Item'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {itemImage
                  ? <img src={itemImage} alt="preview" className="w-full h-full object-cover" />
                  : <Upload size={20} strokeWidth={1.5} className="text-muted-foreground" />}
              </div>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => fileRef.current?.click()}>
                {itemImage ? 'Change Image' : 'Upload Image'}
              </Button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <div>
              <Label className="text-sm font-normal text-muted-foreground">Name *</Label>
              <Input placeholder="Item name" value={itemName} onChange={(e) => setItemName(e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label className="text-sm font-normal text-muted-foreground">Price (₹) *</Label>
              <Input type="number" placeholder="0" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} className="mt-1 rounded-xl" min="0" step="0.5" />
            </div>
            <div>
              <Label className="text-sm font-normal text-muted-foreground">Description</Label>
              <Input placeholder="Short description (optional)" value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} className="mt-1 rounded-xl" />
            </div>
            {categories.length > 0 && (
              <div>
                <Label className="text-sm font-normal text-muted-foreground">Category</Label>
                <Select value={itemCategory} onValueChange={setItemCategory}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowItemDialog(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl press-active" onClick={saveItem}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCatDialog} onOpenChange={setShowCatDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm rounded-3xl">
          <DialogHeader><DialogTitle>{editCat ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Category name" value={catName} onChange={(e) => setCatName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveCat()} className="rounded-xl" />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowCatDialog(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl press-active" onClick={saveCat}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
