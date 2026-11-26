import math
B={'Ryuudou Temple':(160,95),'Tohsaka':(430,215),'Matou':(660,215),'Emiya':(470,505),'Mackenzie':(610,700),'Kotomine Church':(115,680),'Hyatt':(965,225),'Einzbern Castle':(1290,230),'Estate A':(930,585),'Estate B':(1160,760),'Estate C':(250,430),'Uryuu storehouse':(385,775)}
fixed={'Estate A','Estate B','Estate C'}
ks=list(B); ds=sorted((math.hypot(B[a][0]-B[b][0],B[a][1]-B[b][1])*10,a,b) for i,a in enumerate(ks) for b in ks[i+1:])
print('closest:',[(round(d),a,b) for d,a,b in ds[:4]])
avg=sum(min(math.hypot(B[a][0]-B[b][0],B[a][1]-B[b][1])*10 for b in ks if b!=a) for a in ks)/len(ks); print('avg nearest',round(avg))
coast="M40,200 L120,150 L80,20 L300,10 L330,140 L560,120 L700,90 L1060,70 L1180,10 L1385,40 L1390,560 L1280,640 L1300,820 L1020,850 L820,800 L700,860 L480,820 L300,790 L230,860 L40,800 L20,560 L70,470 Z"
D=[('Mount Enzou','#24402c','M80,20 L300,10 L330,140 L300,300 L170,330 L60,250 L40,200 L120,150 Z'),
 ('Western hill','#3a4232','M330,140 L700,95 L700,330 L340,330 Z'),
 ('Miyama old town','#4a4038','M200,340 L700,340 L700,600 L420,620 L200,560 Z'),
 ('Miyama south','#463e3a','M420,630 L700,610 L700,860 L480,820 L380,700 Z'),
 ('Church headland','#30403a','M20,560 L200,560 L380,700 L300,790 L230,860 L40,800 Z'),
 ('Shinto core','#3a3e48','M760,80 L1060,70 L1080,420 L760,430 Z'),
 ('Shinto south and harbour','#3c3a40','M760,450 L1100,440 L1280,640 L1300,820 L1020,850 L820,800 L760,840 Z'),
 ('Einzbern forest','#1f3a28','M1100,50 L1180,10 L1385,40 L1390,560 L1280,620 L1110,430 Z')]
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900" font-family="Inter,Arial,sans-serif">','<rect width="1440" height="900" fill="#0e1f30"/>',
 '<path d="%s" fill="#2d2f2c" stroke="#c9d6e0" stroke-width="3"/>'%coast]
for n,c,p in D: svg.append('<path d="%s" fill="%s" stroke="#00000055" stroke-width="2"/>'%(p,c))
# forest dots
import random; random.seed(3)
def trees(x0,y0,x1,y1,n,poly=None):
  for _ in range(n):
    x=random.uniform(x0,x1); y=random.uniform(y0,y1); svg.append('<circle cx="%.0f" cy="%.0f" r="%.1f" fill="#1a3322" opacity=".9"/>'%(x,y,random.uniform(5,9)))
trees(70,30,320,300,170); trees(1120,60,1380,540,150); trees(560,140,610,320,30); trees(40,600,170,780,40)
# river and lake
svg.append('<path d="M700,90 C705,250 690,420 705,560 C715,700 700,780 705,860 L745,860 C740,780 755,700 745,560 C730,420 745,250 740,80 Z" fill="#1b3a55"/>')
svg.append('<ellipse cx="160" cy="45" rx="70" ry="22" fill="#1e4260"/>')
# roads
R=['M40,640 C300,600 500,560 700,520 L760,515 C900,505 1100,500 1290,560','M330,330 L700,330 L760,330 L1080,330','M600,330 L600,840','M880,80 L880,800','M1080,330 C1150,320 1220,290 1290,230','M300,330 C320,420 350,520 380,700','M180,640 C250,620 300,600 330,600']
for r in R: svg.append('<path d="%s" fill="none" stroke="#8a8a86" stroke-width="7" stroke-linecap="round"/>'%r)
svg.append('<path d="M160,110 C175,170 200,240 240,330" fill="none" stroke="#b9a98a" stroke-width="5" stroke-dasharray="3 4"/>')
svg.append('<path d="M140,110 C110,150 90,190 70,220" fill="none" stroke="#7a6a52" stroke-width="2" stroke-dasharray="2 6" opacity=".8"/>')
svg.append('<circle cx="68" cy="226" r="7" fill="#0b0b0b" stroke="#7a6a52" stroke-width="2"/><text x="20" y="252" fill="#c9b898" font-size="12">cave (hidden trail)</text>')
# alleys (dark)
for a in ['M450,380 L470,560','M520,400 L540,560','M800,150 L820,400','M960,300 L1000,420','M790,500 L840,700']: svg.append('<path d="%s" stroke="#111" stroke-width="4" opacity=".85"/>'%a)
# district labels
LB={'Mount Enzou':(150,295),'Western hill':(470,145),'Miyama old town':(300,365),'Miyama south':(470,800),'Church headland':(40,765),'Shinto core':(800,115),'Shinto south and harbour':(900,820),'Einzbern forest':(1180,520)}
for n,(x,y) in LB.items(): svg.append('<text x="%d" y="%d" fill="#e9e4d3" font-size="15" font-weight="700" letter-spacing="1" opacity=".85">%s</text>'%(x,y,n.upper()))
svg.append('<text x="565" y="240" fill="#9fb59a" font-size="11" transform="rotate(-80 585 240)">ravine</text>')
for n,(x,y) in B.items():
  col='#e0b84a' if n not in fixed and n!='Uryuu storehouse' else ('#7fc4ee' if n in fixed else '#c8283a')
  svg.append('<circle cx="%d" cy="%d" r="11" fill="%s" stroke="#0b121a" stroke-width="3"/>'%(x,y,col))
  svg.append('<text x="%d" y="%d" fill="#fff" font-size="13" font-weight="600" stroke="#0b121a" stroke-width="3" paint-order="stroke">%s</text>'%(x+15,y+5,n))
leg=[('#e0b84a','canon home'),('#c8283a','new unique residence'),('#7fc4ee','estate / safehouse plot'),('#111','dark alley')]
svg.append('<rect x="1060" y="600" width="0" height="0"/>')
lx,ly=20,880
for i,(c,t) in enumerate(leg): svg.append('<circle cx="%d" cy="%d" r="7" fill="%s" stroke="#ccc"/><text x="%d" y="%d" fill="#ddd" font-size="12">%s</text>'%(470+i*150,25,c,484+i*150,29,t))
svg.append('<text x="770" y="54" fill="#aab" font-size="12">closest rival bases: %d units (today 1,423)</text>'%round(ds[0][0]))

svg.append('<text x="20" y="890" fill="#8899aa" font-size="12">Draft blockout, about 14,000 x 8,600 units. Not to final scale.</text>')

P={'Homurahara Academy':(800,640),'Shopping arcade':(560,430),'Miyama Station':(640,560),'Fuyuki Bridge':(720,330),'Mion Bridge':(720,520),'River (Horror)':(690,425),'Rail bridge':(720,180),'Fuyuki Station':(930,390),'Center Building':(1010,150),'Verde mall':(1050,300),'Semina Apts':(820,250),'Civic Hall & park':(1040,520),'Docks & warehouses':(1180,640),'Cemetery':(60,610),'Church summons':(175,725),'Waver\'s clearing':(1180,120),'Einzbern courtyard':(1325,200)}
for n,(x,y) in P.items():
  svg.append('<path d="M%d,%d l7,7 l-7,7 l-7,-7 Z" fill="#d6d0f0" stroke="#0b121a" stroke-width="2"/>'%(x,y-7))
  svg.append('<text x="%d" y="%d" fill="#d6d0f0" font-size="11" stroke="#0b121a" stroke-width="3" paint-order="stroke">%s</text>'%(x+10,y+4,n.replace('&','and')))
SH={'Safehouse 1':(1000,450),'Safehouse 2':(870,760),'Safehouse 3':(95,440),'Safehouse 4':(520,385),'Safehouse 5':(1200,470)}
for n,(x,y) in SH.items():
  svg.append('<rect x="%d" y="%d" width="13" height="13" fill="#8fd3a8" stroke="#0b121a" stroke-width="2"/>'%(x-6,y-6))
  svg.append('<text x="%d" y="%d" fill="#bfe8cc" font-size="11" stroke="#0b121a" stroke-width="3" paint-order="stroke">%s</text>'%(x+10,y+4,n))
allb=dict(B); 
md=min((math.hypot(SH[a][0]-allb[b][0],SH[a][1]-allb[b][1])*10,a,b) for a in SH for b in allb)
print('safehouse nearest base',round(md[0]),md[1],md[2])
for i,(c,t) in enumerate([('#d6d0f0','point of interest'),('#8fd3a8','backup safehouse')]): svg.append('<circle cx="%d" cy="50" r="7" fill="%s" stroke="#ccc"/><text x="%d" y="54" fill="#ddd" font-size="12">%s</text>'%(470+i*150,c,484+i*150,t))
svg.append('</svg>'); open('mapdraft.svg','w').write('\n'.join(svg))
