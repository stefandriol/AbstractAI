import { ChatCompletionRequestMessageRoleEnum } from 'openai-edge';

interface Message {
    role: ChatCompletionRequestMessageRoleEnum;
    content: string;
}

interface Paper {
    title: string;
    abstract: string;
}

const getMessages = (arxivCategory: string, interest: string): Message[] => {

    const messages: Message[] = [];

    messages.push({
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: "You are an assistant to a researcher who wants to stay up to date with the latest papers in their field."
    });

const papers: Paper[] = [
	{
        'title':
        'A Spin on the Bulk Locality of Slightly Broken Higher Spin Theories',
        'abstract':
        "In this paper, we investigate if it is possible to express correlation functions in Large N Chern-Simons (CS) matter theories/ Slightly Broken Higher Spin (SBHS) theories purely in terms of single trace twist conformal blocks (TCBs). For this, we first develop the machinery for spinning TCBs. We do this both by explicitly solving the spinning TCB eigenvalue equation taking into account consistency with the operator product expansion (OPE) and crossing symmetry, and also by employing weight shifting and spin raising operators and acting with them on scalar seeds. Using these results we show that spinning correlators in theories with exact higher spin symmetry can be entirely expressed in terms of single trace TCBs. However, when the higher spin symmetry is slightly broken at large- N, even though the scalar four-point function is given by single-trace TCBs, the spinning correlators in general, are not. Our results suggest that it may be possible to identify a sub-sector of SBHS theory which has a local bulk dual.",
    }, {
        'title':
        "Hydrodynamic and Non-hydrodynamic Excitations in Kinetic Theory -- A Numerical Analysis in Scalar Field Theory",
        'abstract':
        "Viscous hydrodynamics serves as a successful mesoscopic description of the Quark-Gluon Plasma produced in relativistic heavy-ion collisions. In order to investigate, how such an effective description emerges from the underlying microscopic dynamics we calculate the hydrodynamic and non-hydrodynamic modes of linear response in the sound channel from a first-principle calculation in kinetic theory. We do this with a new approach wherein we discretize the collision kernel to directly calculate eigenvalues and eigenmodes of the evolution operator. This allows us to study the Green's functions at any point in the complex frequency space. Our study focuses on scalar theory with quartic interaction and we find that the analytic structure of Green's functions in the complex plane is far more complicated than just poles or cuts which is a first step towards an equivalent study in QCD kinetic theory.",
    }, {
        'title':
        "Renormalization and spectra of the Pöschl-Teller potential",
        'abstract':
        "We study the energy eigenfunctions and spectrum of the P\"oschl-Teller potential for every value of its two dimensionless parameters. The potential has a singularity at the origin which, in some regions of parameter space, makes boundary conditions of the eigenfunctions ill-defined. We apply a renormalization procedure to obtain a family of well-defined solutions, and study the associated renormalization group (RG) flow. Renormalization introduces an anomalous length scale by ``dimensional transmutation''. In the regions of coupling space where this scale cannot be set to zero, it spontaneously breaks the asymptotic conformal symmetry near the singularity. The symmetry is also explicitly broken by a dimensionful parameter in the potential. The existence of these two competing ways of breaking conformal symmetry gives the RG flow an interesting structure. We show that supersymmetry of the potential, when present, allows one to prevent spontaneous breaking of the asymptotic conformal symmetry. We use the family of eigenfunctions to compute the S-matrix in all regions of parameter space, for any value of anomalous scale. Then we systematically study the poles of the S-matrix to classify all bound, anti-bound and metastable states.",
    }, {
        'title':
        "Cancellation of quantum corrections on the soft curvature perturbations",
        'abstract':
        "We study the cancellation of quantum corrections on the superhorizon curvature perturbations from subhorizon physics beyond the single-clock inflation from the viewpoint of the cosmological soft theorem. As an example, we focus on the transient ultra-slow-roll inflation scenario and compute the one-loop quantum corrections to the power spectrum of curvature perturbations taking into account nontrivial surface terms in the action. We find that Maldacena's consistency relation is satisfied and guarantees the cancellation of contributions from the short-scale modes. As a corollary, primordial black hole production in single-field inflation scenarios is not excluded by perturbativity breakdown even for the sharp transition case in contrast to some recent claims in the literature. We also comment on the relation between the tadpole diagram in the in-in formalism and the shift of the elapsed time in the stochastic-δN formalism. We find our argument is not directly generalisable to the tensor perturbations.",
    }, {
        'title':
        "Two Concepts of Holographic Complexity under Thermal and Electromagnetic Quenches",
        'abstract':
        "We study the evolution of holographic subregion complexity (HSC) in a thermally and magnetically quenched strongly coupled quantum field theory in 2+1 dimension. We illustrate two concepts of complexity in this theory, (1): how much information it takes to specify a state by studying the behavior of the final value of HSC in terms of the final temperature and magnetic field and (2): how long it takes to reach the state, by considering the time it takes for HSC to relax as a function of the final temperature and magnetic field. In the first concept, we observe that the effect of temperature and magnetic field on HSC is decreasing until the energy of the probe is comparable to the final temperature and magnetic field. We present an argue based on an ensemble of microstates corresponding to a given mixed macrostate. In the second concept, we show that the time of relaxation of HSC decreases with the increase of temperature and magnetic field for fixed value of the energy of the probe. We also compare the time evolution of HSC for two quenches, in the first concept. We observe that the absolute value of the ratio of the final value of HSC for two kinds of quenches depends on the energy of the probe."
    }]

    messages.push({
    role: ChatCompletionRequestMessageRoleEnum.User,
    content: "Paper titles and abstracts to summarize: " + JSON.stringify(papers)
});

    messages.push({
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Only summarize the papers that are strictly relevant for my interests: ${interest}${
          interest.slice(-1) === '.' ? '' : '.'} Use less than 200 characters for each summary and include the title. Make a double linebreak after each summary.`,
    });
    
    return messages; 
}

export default getMessages;
