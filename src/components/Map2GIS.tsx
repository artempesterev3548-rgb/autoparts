'use client'
import Script from 'next/script'

export default function Map2GIS() {
  return (
    <>
      <div id="dgmap" style={{ width: '100%', height: '100%' }} />
      <Script
        id="2gis-api"
        src="https://maps.api.2gis.ru/2.0/loader.js"
        onLoad={() => {
          ;(window as any).DG.then(function () {
            const map = (window as any).DG.map('dgmap', {
              center: [53.711169, 91.331102],
              zoom: 16,
            })
            ;(window as any).DG.marker([53.711169, 91.331102])
              .addTo(map)
              .bindPopup('<b>QPart Автосервис</b><br>ул. 70 лет БелАЗу, 51 стр1<br>Усть-Абакан')
              .openPopup()
          })
        }}
      />
    </>
  )
}
