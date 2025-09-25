function afficherPhoto(event){
    const file=event.target.files[0];
    if(file){
        const reader=new FileReader();
        reader.onload=function(e){
            document.getElementById('photo-preview').innerHTML=`<img src="${e.target.result}" alt="Photo de profil"/>`;
            document.querySelectorAll('.cv-photo').forEach(el=>{
                el.innerHTML=`<img src="${e.target.result}" alt="Photo de profil"/>`;
            });
        };
        reader.readAsDataURL(file);
    }
}

function changerCouleur(option){
    document.querySelectorAll('.color-option').forEach(opt=>opt.classList.remove('selected'));
    option.classList.add('selected');
    const primary=option.getAttribute('data-primary');
    const secondary=option.getAttribute('data-secondary');
    document.documentElement.style.setProperty('--primary-color',primary);
    document.documentElement.style.setProperty('--secondary-color',secondary);
    document.documentElement.style.setProperty('--sidebar-bg',primary);
    mettreAJourCV();
}

function ajouterExperience(){
    const div=document.createElement('div');
    div.className='experience';
    div.innerHTML=`
        <input type="text" class="poste" placeholder="Poste" oninput="mettreAJourCV()"/>
        <input type="text" class="entreprise" placeholder="Entreprise" oninput="mettreAJourCV()"/>
        <input type="text" class="periode" placeholder="Période" oninput="mettreAJourCV()"/>
        <textarea class="description" placeholder="Description" rows="3" oninput="mettreAJourCV()"></textarea>
    `;
    document.getElementById('experiences').appendChild(div);
}

function ajouterFormation(){
    const div=document.createElement('div');
    div.className='formation';
    div.innerHTML=`
        <input type="text" class="diplome" placeholder="Diplôme" oninput="mettreAJourCV()"/>
        <input type="text" class="etablissement" placeholder="Établissement" oninput="mettreAJourCV()"/>
        <input type="text" class="annee" placeholder="Année" oninput="mettreAJourCV()"/>
    `;
    document.getElementById('formations').appendChild(div);
}

function interchangerFormationsExperiences(){
    const fContainer=document.getElementById('formations');
    const eContainer=document.getElementById('experiences');
    const temp=document.createElement('div');
    temp.innerHTML=fContainer.innerHTML;
    fContainer.innerHTML=eContainer.innerHTML;
    eContainer.innerHTML=temp.innerHTML;
    mettreAJourCV();
}

function mettreAJourCV(){
    genererPagesCV();
}

function genererPagesCV(){
    const preview=document.getElementById('cv-preview-container');
    preview.innerHTML='';

    const nom=document.getElementById('nom').value || "Nom Prénom";
    const metier=document.getElementById('metier').value || "Métier";
    const adresse=document.getElementById('adresse').value || "Adresse";
    const email=document.getElementById('email').value || "Email";
    const telephone=document.getElementById('telephone').value || "Téléphone";
    const naissance=document.getElementById('naissance').value || "Date de naissance";
    const permis=document.getElementById('permis').checked;
    const accroche=document.getElementById('accroche').value || "";
    const skills=document.getElementById('skills').value.split(',').map(s=>s.trim()).filter(s=>s);

    const experiences=document.querySelectorAll('#experiences .experience');
    const formations=document.querySelectorAll('#formations .formation');

    const contentArr=[];

    // Ajout warning si >1 page
    let totalContentLength=accroche.length + skills.join(',').length;
    experiences.forEach(exp=>{
        totalContentLength+=exp.querySelector('.poste').value.length + exp.querySelector('.entreprise').value.length + exp.querySelector('.description').value.length;
    });
    formations.forEach(f=>{
        totalContentLength+=f.querySelector('.diplome').value.length + f.querySelector('.etablissement').value.length;
    });

    const showWarning=totalContentLength>1200; // seuil pour >1 page

    const page=document.createElement('div');
    page.className='cv-page';
    let sidebarHTML=`
        <div class="cv-sidebar">
            <div class="cv-photo photo-upload"></div>
            <h1>${nom}</h1>
            <h2>${metier}</h2>
            ${adresse?`<p><i class="fas fa-map-marker-alt"></i> ${adresse}</p>`:''}
            ${email?`<p><i class="fas fa-envelope"></i> ${email}</p>`:''}
            ${telephone?`<p><i class="fas fa-phone"></i> ${telephone}</p>`:''}
            ${naissance?`<p><i class="fas fa-birthday-cake"></i> ${naissance}</p>`:''}
            ${permis?`<p><i class="fas fa-car"></i> Permis de conduire</p>`:''}
            ${skills.length?`<h3>Compétences / Qualités</h3>`:''}
            ${skills.map(s=>`<span class="skill-bubble">${s}</span>`).join('')}
        </div>
    `;
    let mainHTML=`<div class="cv-main">`;
    if(accroche) mainHTML+=`<div class="accroche"><p>${accroche}</p></div>`;
    if(experiences.length){
        mainHTML+=`<h2>Expériences</h2>`;
        experiences.forEach(exp=>{
            const poste=exp.querySelector('.poste').value || '';
            const entreprise=exp.querySelector('.entreprise').value || '';
            const periode=exp.querySelector('.periode').value || '';
            const desc=exp.querySelector('.description').value || '';
            if(poste||entreprise||desc){
                mainHTML+=`
                    <div style="margin-bottom:10px; padding-left:10px; border-left:3px solid var(--secondary-color);">
                        <h3>${poste}</h3>
                        <p style="font-style:italic;">${entreprise}${periode?` (${periode})`:''}</p>
                        <p>${desc}</p>
                    </div>
                `;
            }
        });
    }
    if(formations.length){
        mainHTML+=`<h2>Formations</h2>`;
        formations.forEach(f=>{
            const diplome=f.querySelector('.diplome').value || '';
            const etab=f.querySelector('.etablissement').value || '';
            const annee=f.querySelector('.annee').value || '';
            if(diplome||etab||annee){
                mainHTML+=`
                    <div style="margin-bottom:10px; padding-left:10px; border-left:3px solid var(--secondary-color);">
                        <h3>${diplome}</h3>
                        <p style="font-style:italic;">${etab}</p>
                        <p>${annee}</p>
                    </div>
                `;
            }
        });
    }
    if(showWarning) mainHTML=`<div class="warning">⚠ Un CV multipage n'est pas recommandé pour une candidature optimale.</div>`+mainHTML;
    mainHTML+='</div>';

    page.innerHTML=sidebarHTML+mainHTML;
    preview.appendChild(page);

    // mettre photo
    const photoSrc=document.querySelector('#photo-preview img')?.src;
    if(photoSrc){
        document.querySelectorAll('.cv-photo').forEach(el=>{
            el.innerHTML=`<img src="${photoSrc}" alt="Photo"/>`;
        });
    }
}

async function genererPDF(){
    const { jsPDF } = window.jspdf;
    const pages=document.querySelectorAll('.cv-page');
    const pdf=new jsPDF({orientation:'portrait', unit:'mm', format:'a4'});

    for(let i=0;i<pages.length;i++){
        const canvas=await html2canvas(pages[i], {scale:2,useCORS:true,allowTaint:true, logging:false, backgroundColor:'#ffffff'});
        const imgData=canvas.toDataURL('image/jpeg',1.0);
        if(i>0) pdf.addPage();
        pdf.addImage(imgData,'JPEG',0,0,210,297);
    }
    pdf.save('cv.pdf');
}

// initialisation
mettreAJourCV();