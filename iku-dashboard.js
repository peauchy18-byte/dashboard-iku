/* Dashboard Capaian IKU — Universitas Andalas
   File ini di-host di GitHub Pages, dipanggil dari Joomla module */
(function(){
  // Tunggu Chart.js selesai load
  function waitChart(cb){
    if(window.Chart){cb();}
    else{setTimeout(function(){waitChart(cb);},100);}
  }

  var DATA=[
    {id:1,name:"Lulusan mendapat pekerjaan layak",       unit:"%",    c:[10.75,52.27,66.68,60.80],t:[80,60,80,80]    },
    {id:2,name:"Mahasiswa berprestasi",                  unit:"%",    c:[1.33,18.92,4.22,8.35],   t:[30,25,40,40]    },
    {id:3,name:"Dosen berkegiatan luar kampus",          unit:"%",    c:[7.72,20.49,40.60,59.85], t:[20,30,30,32.1]  },
    {id:4,name:"Praktisi mengajar",                      unit:"%",    c:[38.35,49.91,5.09,6.60],  t:[40,50,25,25]    },
    {id:5,name:"Hasil kerja dosen digunakan masyarakat", unit:"hasil",c:[2.76,7.60,7.26,4.81],    t:[0.5,1,1,6]      },
    {id:6,name:"Prodi terakreditasi internasional",      unit:"prodi",c:[0.35,0.92,0.95,2.00],    t:[0.5,0.5,0.7,2.6]},
    {id:7,name:"Kelas kolaborasi & berwawasan global",   unit:"%",    c:[18.70,29.21,22.00,15.33], t:[35,50,50,58.1] },
    {id:8,name:"Prodi siap jadi PTN-BH",                 unit:"%",    c:[34.62,28.00,21.57,33.00], t:[8,5,10,33.33]  }
  ];
  var YEARS=['2021','2022','2023','2024'];
  var active=0, chartInst=null;

  function pct(d){return Math.round((d.c[3]/d.t[3])*100);}
  function dot(d){var p=pct(d);return p>=90?'#4ade80':p>=60?'#fbbf24':'#f87171';}
  function arw(v){return v>0?{s:'▲',c:'up',dc:'da-up'}:v<0?{s:'▼',c:'dn',dc:'da-dn'}:{s:'—',c:'fl',dc:'da-fl'};}

  function trend(d){
    var ups=d.c.filter(function(v,i){return i>0&&v>d.c[i-1];}).length;
    var ov=+(d.c[3]-d.c[0]).toFixed(2);
    if(ups>=2&&ov>0) return{cls:'bnr-up', ico:'📈',ttl:'IKU '+d.id+' — Tren Meningkat',  dsc:'Capaian naik dari '+d.c[0]+' menjadi '+d.c[3]+' '+d.unit+' selama 4 tahun (+'+ov+')'};
    if(ups<=1&&ov<0) return{cls:'bnr-dn', ico:'📉',ttl:'IKU '+d.id+' — Tren Menurun',    dsc:'Capaian turun dari '+d.c[0]+' menjadi '+d.c[3]+' '+d.unit+' selama 4 tahun ('+ov+')'};
    return             {cls:'bnr-mix',ico:'〰️',ttl:'IKU '+d.id+' — Tren Fluktuatif',dsc:'Capaian bergerak naik-turun, posisi 2024: '+d.c[3]+' '+d.unit};
  }

  function pClass(p){return p>=90?'mc-g':p>=60?'mc-y':'mc-r';}
  function pLabel(p){return p>=90?'Tercapai ✓':p>=60?'Mendekati target':'Di bawah target';}

  function buildTabs(){
    var el=document.getElementById('ikuTabs');
    if(!el) return;
    el.innerHTML='';
    DATA.forEach(function(d,i){
      var div=document.createElement('div');
      div.className='iku-tab'+(i===active?' on':'');
      div.innerHTML='<div class="tnum">IKU '+d.id+'</div><div class="tdot" style="background:'+(i===active?'rgba(255,255,255,.6)':dot(d))+'"></div>';
      div.onclick=function(){active=i;buildTabs();render();};
      el.appendChild(div);
    });
  }

  function render(){
    var d=DATA[active], tr=trend(d), p=pct(d);
    var maxV=Math.max.apply(null,d.c)*1.15||1;

    var bnr=document.getElementById('ikuBnr');
    if(bnr){
      bnr.className='iku-bnr '+tr.cls;
      bnr.innerHTML='<div class="bnr-ico">'+tr.ico+'</div><div><div class="bnr-ttl">'+tr.ttl+'</div><div class="bnr-dsc">'+tr.dsc+'</div></div>';
    }

    var cards=document.getElementById('ikuCards');
    if(cards) cards.innerHTML=
      '<div class="iku-mc mc-b"><div class="mc-lbl">Capaian 2021</div><div class="mc-val">'+d.c[0]+'</div><div class="mc-sub">'+d.unit+'</div></div>'+
      '<div class="iku-mc mc-b"><div class="mc-lbl">Capaian 2024</div><div class="mc-val">'+d.c[3]+'</div><div class="mc-sub">'+d.unit+'</div></div>'+
      '<div class="iku-mc mc-b"><div class="mc-lbl">Target 2024</div><div class="mc-val">'+d.t[3]+'</div><div class="mc-sub">'+d.unit+'</div></div>'+
      '<div class="iku-mc '+pClass(p)+'"><div class="mc-lbl">Realisasi vs Target</div><div class="mc-val">'+p+'%</div><div class="mc-sub">'+pLabel(p)+'</div></div>';

    var chName=document.getElementById('ikuChName');
    if(chName) chName.textContent='IKU '+d.id+' — '+d.name+' ('+d.unit+')';

    var canvas=document.getElementById('ikuChart');
    if(canvas){
      if(chartInst){chartInst.destroy();chartInst=null;}
      chartInst=new Chart(canvas.getContext('2d'),{
        type:'line',
        data:{
          labels:YEARS,
          datasets:[
            {label:'Capaian',data:d.c,borderColor:'#1d4ed8',backgroundColor:'rgba(29,78,216,0.08)',
             borderWidth:2.5,pointBackgroundColor:'#1d4ed8',pointRadius:5,pointHoverRadius:7,fill:true,tension:0.35},
            {label:'Target',data:d.t,borderColor:'#f97316',backgroundColor:'transparent',
             borderWidth:2,borderDash:[6,4],pointStyle:'triangle',pointBackgroundColor:'#f97316',pointRadius:5,fill:false,tension:0.35}
          ]
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{
            legend:{display:false},
            tooltip:{callbacks:{label:function(c){return ' '+c.dataset.label+': '+c.parsed.y+' '+d.unit;}}}
          },
          scales:{
            x:{grid:{color:'rgba(0,0,0,0.05)'},ticks:{font:{size:11}}},
            y:{grid:{color:'rgba(0,0,0,0.05)'},ticks:{font:{size:10},callback:function(v){return v+' '+d.unit;}}}
          }
        }
      });
    }

    // Year bars
    var yr=document.getElementById('ikuYr');
    if(yr){
      yr.innerHTML='';
      d.c.forEach(function(v,i){
        var pBar=Math.max(Math.round((v/maxV)*100),3);
        var hit=v>=d.t[i];
        var delta=i===0?null:v-d.c[i-1];
        var a=delta===null?{s:'',c:'fl'}:arw(delta);
        yr.innerHTML+='<div class="iku-yr">'+
          '<div class="yr-top">'+
            '<span class="yr-yr">'+YEARS[i]+'</span>'+
            '<span class="yr-st" style="color:'+(hit?'#15803d':'#991b1b')+'">'+(hit?'✓ tercapai':'✗ belum')+'</span>'+
            '<div class="yr-rt"><span class="'+a.c+'">'+a.s+' '+(delta===null?'—':(delta>0?'+':'')+delta.toFixed(2))+'</span><span>'+v+'</span></div>'+
          '</div>'+
          '<div class="bg-bar"><div class="in-bar" style="width:'+pBar+'%;background:'+(hit?'#16a34a':'#1d4ed8')+'"><span>'+v+'</span></div></div>'+
        '</div>';
      });
    }

    // Delta
    var del=document.getElementById('ikuDelta');
    if(del){
      del.innerHTML='';
      [{l:'2021 → 2022',v:d.c[1]-d.c[0]},{l:'2022 → 2023',v:d.c[2]-d.c[1]},{l:'2023 → 2024',v:d.c[3]-d.c[2]}]
      .forEach(function(r){
        var a=arw(r.v);
        del.innerHTML+='<div class="iku-di">'+
          '<div class="da '+a.dc+'">'+a.s+'</div>'+
          '<div class="d-lbl">'+r.l+'</div>'+
          '<div class="d-val '+a.c+'">'+(r.v>0?'+':'')+r.v.toFixed(2)+' '+d.unit+'</div>'+
        '</div>';
      });
    }
  }

  waitChart(function(){
    buildTabs();
    render();
  });
})();
