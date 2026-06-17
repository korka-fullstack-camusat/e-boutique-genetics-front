"use client";
import { X, Download } from "lucide-react";

export interface InvoiceData {
  orderId: number;
  orderDate: Date;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerAddress?: string | null;
  paymentMethod: string;
  items: { product_name: string; quantity: number; price: number }[];
  totalAmount: number;
  acompteAmount?: number | null;
}

interface Props {
  open: boolean;
  data: InvoiceData | null;
  onClose: () => void;
}

function fmt(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function InvoiceModal({ open, data, onClose }: Props) {
  if (!open || !data) return null;

  const isAcompte   = (data.acompteAmount ?? 0) > 0;
  const acompte     = data.acompteAmount ?? 0;
  const solde       = data.totalAmount - acompte;
  const dateStr     = fmt(data.orderDate);
  const year        = data.orderDate.getFullYear();
  const num         = String(data.orderId).padStart(3, "0");

  // Numéros distincts : FA = facture solde / AC = acompte
  const invoiceNum  = isAcompte
    ? `AC-${year}-${num}`
    : `FA-${year}-${num}`;

  const invoiceType = isAcompte ? "Facture d'Acompte" : "Facture";

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  function handlePrint() {
    const logoUrl = `${baseUrl}/logo.jpeg`;

    const rows = data!.items.map((it) => `
      <tr>
        <td style="padding:10px 8px;font-size:13px;color:#333;">${it.product_name}</td>
        <td style="padding:10px 8px;text-align:center;font-size:13px;">${it.quantity.toFixed(2)}</td>
        <td style="padding:10px 8px;text-align:right;font-size:13px;">${it.price.toLocaleString("fr-FR")},00</td>
        <td style="padding:10px 8px;text-align:right;font-size:13px;font-weight:600;">${(it.price * it.quantity).toLocaleString("fr-FR")} CFA</td>
      </tr>`).join("");

    // Bloc financier bas de tableau — diffère selon paiement complet ou acompte
    const financialRows = isAcompte ? `
      <tr style="background:#fafafa;border-top:2px solid #ddd;">
        <td colspan="3" style="padding:10px 8px;font-size:14px;font-weight:900;">Total commande</td>
        <td style="padding:10px 8px;text-align:right;font-size:14px;font-weight:900;color:#c9a227;">${data!.totalAmount.toLocaleString("fr-FR")} CFA</td>
      </tr>
      <tr style="background:#f0f0ff;">
        <td colspan="3" style="padding:10px 8px;font-size:13px;font-weight:700;color:#5b21b6;">Acompte reçu (Wave)</td>
        <td style="padding:10px 8px;text-align:right;font-size:13px;font-weight:700;color:#5b21b6;">−${acompte.toLocaleString("fr-FR")} CFA</td>
      </tr>
      <tr style="background:#fff7ed;border-top:3px solid #f97316;">
        <td colspan="3" style="padding:12px 8px;font-size:15px;font-weight:900;color:#ea580c;">SOLDE RESTANT DÛ</td>
        <td style="padding:12px 8px;text-align:right;font-size:16px;font-weight:900;color:#ea580c;">${solde.toLocaleString("fr-FR")} CFA</td>
      </tr>` : `
      <tr style="background:#fafafa;border-top:2px solid #ddd;">
        <td colspan="3" style="padding:12px 8px;font-size:15px;font-weight:900;">Total réglé</td>
        <td style="padding:12px 8px;text-align:right;font-size:16px;font-weight:900;color:#c9a227;">${data!.totalAmount.toLocaleString("fr-FR")} CFA</td>
      </tr>`;

    const conditionPaiement = isAcompte
      ? `Acompte de ${acompte.toLocaleString("fr-FR")} CFA reçu. Solde de ${solde.toLocaleString("fr-FR")} CFA dû à la livraison.`
      : `100% à la commande. Paiement intégral reçu.`;

    const badgeHtml = isAcompte
      ? `<div style="display:inline-block;background:#fff7ed;border:2px solid #f97316;color:#ea580c;font-weight:900;font-size:12px;padding:3px 12px;border-radius:20px;letter-spacing:1px;margin-bottom:8px;">ACOMPTE</div>`
      : `<div style="display:inline-block;background:#f0fdf4;border:2px solid #16a34a;color:#15803d;font-weight:900;font-size:12px;padding:3px 12px;border-radius:20px;letter-spacing:1px;margin-bottom:8px;">SOLDÉ</div>`;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${invoiceNum}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #222; background: #fff; padding: 32px 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .logo-block { display: flex; align-items: center; gap: 12px; }
    .logo-block img { height: 60px; object-fit: contain; }
    .company-info { font-size: 12px; color: #444; line-height: 1.7; }
    .company-info strong { color: #111; font-size: 14px; display: block; margin-bottom: 4px; }
    .tagline { font-style: italic; color: #b8860b; font-size: 12px; margin-top: 6px; }
    .client-block { text-align: right; font-size: 13px; font-weight: 700; color: #333; }
    .invoice-title { font-size: 26px; font-weight: 900; color: #c9a227; margin: 20px 0 4px; }
    .meta-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 24px; border-top: 2px solid #c9a227; padding-top: 12px; }
    .meta-cell label { font-size: 11px; font-weight: 700; color: #666; display: block; margin-bottom: 2px; }
    .meta-cell span { font-size: 13px; color: #111; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #f5f5f5; }
    thead th { padding: 10px 8px; text-align: left; font-size: 12px; font-weight: 700; color: #444; border-bottom: 2px solid #ddd; }
    thead th:not(:first-child) { text-align: right; }
    thead th:nth-child(3) { text-align: center; }
    .section-header td { padding: 10px 8px; font-weight: 900; font-size: 13px; background: #fafafa; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }
    tbody tr { border-bottom: 1px solid #f0f0f0; }
    .footer-info { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 12px; }
    .conditions { font-size: 12px; color: #444; line-height: 1.8; max-width: 55%; }
    .conditions strong { font-size: 12px; color: #111; }
    .signature-block { text-align: center; }
    .stamp { border: 1px solid #999; padding: 8px 14px; font-size: 10px; line-height: 1.6; color: #555; display: inline-block; }
    .sig-label { font-size: 12px; color: #555; margin-top: 6px; }
    .page-footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 12px; text-align: center; font-size: 11px; color: #777; line-height: 1.8; }
    .page-footer a { color: #c9a227; text-decoration: none; }
    @media print {
      body { padding: 16px 24px; }
      button { display: none !important; }
      @page { size: A4; margin: 1cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-block">
      <img src="${logoUrl}" alt="Genetics" />
      <div>
        <div class="company-info">
          <strong>GLOBAL ENERGIES AND IT</strong>
          <span>Adresse : ZAC MBAO, ROND-POINT SIPRES</span><br/>
          <span>N° de téléphone : +221 78 879 00 00</span><br/>
          <span>RC : SN.DKR.2025.B.22955</span><br/>
          <span>NINEA : 012204559</span>
        </div>
        <div class="tagline">Transform your business by the digital</div>
      </div>
    </div>
    <div class="client-block">${data!.customerName.toUpperCase()}</div>
  </div>

  ${badgeHtml}
  <div class="invoice-title">${invoiceType} ${invoiceNum}</div>

  <div class="meta-grid">
    <div class="meta-cell"><label>Date de facturation</label><span>${dateStr}</span></div>
    <div class="meta-cell"><label>Date d'échéance</label><span>${dateStr}</span></div>
    <div class="meta-cell"><label>Référence</label><span>${invoiceNum}</span></div>
    <div class="meta-cell"><label>Mode de paiement</label><span>${data!.paymentMethod}</span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:50%">Description</th>
        <th style="width:15%;text-align:center">Quantité</th>
        <th style="width:17%;text-align:right">Prix unitaire</th>
        <th style="width:18%;text-align:right">Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr class="section-header">
        <td colspan="3">PRODUITS</td>
        <td style="text-align:right;font-weight:900">${data!.totalAmount.toLocaleString("fr-FR")} CFA</td>
      </tr>
      ${rows}
      ${financialRows}
    </tbody>
  </table>

  <div class="footer-info">
    <div class="conditions">
      Communication de paiement : <strong>${invoiceNum}</strong><br/>
      <span style="text-decoration:underline">Condition de paiement</span> : ${conditionPaiement}
    </div>
    <div class="signature-block">
      <div class="stamp">
        Global Energie and IT<br/>
        RC : SN.DKR.2025.B.22955<br/>
        NINEA : 012204559<br/>
        Adresse : Zac Mbao, Rond-Point SIPRES<br/>
        Tél : +221 78 879 00 00
      </div>
      <div class="sig-label">Signataire autorisé</div>
    </div>
  </div>

  <div class="page-footer">
    Pour plus d'informations contacter l'email suivant : <a href="mailto:admin@groupegenetics.com">admin@groupegenetics.com</a><br/>
    Site web : <a href="https://www.groupegenetics.com">www.groupegenetics.com</a>
    <br/><br/>Page 1 / 1
  </div>
</body>
</html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  }

  const total = data.totalAmount;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-white px-6 pt-5 pb-4 border-b z-10 flex items-center justify-between">
          <div>
            <h2 className="font-black text-gray-900 text-base">Commande confirmée ✓</h2>
            <p className="text-xs text-gray-400 mt-0.5">{invoiceType} {invoiceNum}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={17} />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* Badge type */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isAcompte
              ? "bg-orange-100 text-orange-600 border border-orange-300"
              : "bg-green-100 text-green-700 border border-green-300"
          }`}>
            {isAcompte ? "Facture d'acompte" : "Facture soldée — Paiement complet"}
          </div>

          {/* Récap */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Articles</p>
            {data.items.map((it, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{it.product_name} × {it.quantity}</span>
                <span className="font-semibold">{(it.price * it.quantity).toLocaleString("fr-FR")} F</span>
              </div>
            ))}
            <div className="flex justify-between font-black text-sm pt-2 border-t border-amber-200">
              <span>Total commande</span>
              <span className="text-amber-700">{total.toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>

          {/* Paiement detail */}
          {isAcompte ? (
            <div className="rounded-2xl overflow-hidden border border-gray-200">
              <div className="flex justify-between items-center px-4 py-3 bg-purple-50">
                <span className="text-sm font-semibold text-purple-700">Acompte reçu (Wave)</span>
                <span className="text-sm font-bold text-purple-700">−{acompte.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-orange-50 border-t-2 border-orange-400">
                <span className="text-sm font-black text-orange-700">Solde restant dû</span>
                <span className="text-base font-black text-orange-700">{solde.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <p className="text-xs text-gray-400 px-4 py-2 bg-gray-50">
                Le solde sera réglé à la livraison.
              </p>
            </div>
          ) : (
            <div className="flex justify-between items-center px-4 py-3 bg-green-50 border border-green-200 rounded-2xl">
              <span className="text-sm font-bold text-green-700">Paiement intégral reçu</span>
              <span className="text-base font-black text-green-700">{total.toLocaleString("fr-FR")} FCFA</span>
            </div>
          )}

          {/* Client */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-1 text-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Client</p>
            <p className="font-semibold">{data.customerName}</p>
            <p className="text-gray-500">{data.customerEmail}</p>
            {data.customerPhone && <p className="text-gray-500">{data.customerPhone}</p>}
            {data.customerAddress && <p className="text-gray-500">{data.customerAddress}</p>}
          </div>

          <p className="text-xs text-gray-400 text-center">
            Confirmation envoyée à <span className="font-semibold text-gray-600">{data.customerEmail}</span>
          </p>

          {/* Bouton PDF */}
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-gray-700 transition-colors"
          >
            <Download size={16} /> Télécharger la facture PDF
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Fermer
          </button>

        </div>
      </div>
    </div>
  );
}
