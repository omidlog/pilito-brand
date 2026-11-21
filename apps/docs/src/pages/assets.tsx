import useBaseUrl from '@docusaurus/useBaseUrl'
import Layout from '@theme/Layout'
import assets from '../data/assets.json'
import { asAssets, type AssetRecord } from '../data/records'

export default function AssetsPage(): React.ReactElement {
  return (
    <Layout title="Assets" description="Asset manifest with honest missing files.">
      <main className="container" style={{ padding: '2rem 0 3rem' }}>
        <h1>Asset gallery</h1>
        <p>Present files can be downloaded. Missing files stay missing. Nothing here is an approved brand mark.</p>
        <div className="grid">
          {asAssets(assets).map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </main>
    </Layout>
  )
}

function AssetCard({ asset }: { asset: AssetRecord }): React.ReactElement {
  const relative = String(asset.path).replace(/^brand\/assets\//, '')
  const href = useBaseUrl(`/brand-assets/${relative}`)
  return (
    <article className="card">
      <p className="badge">{String(asset.status)}</p>
      <h2>{String(asset.name)}</h2>
      <p>
        <code>{String(asset.id)}</code>
      </p>
      <p>{asset.present ? 'File is in the repository.' : String('missing_reason' in asset ? asset.missing_reason : 'Missing.')}</p>
      <p>Visibility: {String(asset.visibility)}</p>
      {'downloadable' in asset && asset.downloadable ? (
        <>
          <img src={href} alt="" width={160} height={80} />
          <a href={href}>Download approved file</a>
        </>
      ) : (
        <p>Not published. Only an approved public asset is copied into the site.</p>
      )}
    </article>
  )
}
