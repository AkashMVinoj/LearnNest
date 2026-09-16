import { Link } from 'react-router-dom';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import {
  BookOpen, PlayCircle, FileText, Users, Award, TrendingUp,
  CheckCircle, ArrowRight, Sparkles, Star, Zap, Globe,
  GraduationCap, Target, Shield, Heart, Mail, Phone, MapPin,
  MessageCircle, Share2, AtSign, Rss, Send
} from 'lucide-react';

export default function Home() {
  const token = localStorage.getItem('access_token');

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* ============================================
          HERO SECTION
      ============================================ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white border border-blue-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Your journey to mastery starts here</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Learn smarter with{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  LearnNest
                </span>
              </h1>

              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                A modern learning platform where students explore courses, track progress,
                and master new skills with live classes, study materials, and assignments — all in one place.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  to={token ? '/dashboard' : '/login'}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  {token ? 'Go to Dashboard' : 'Start Learning Free'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-medium px-6 py-3.5 rounded-xl transition-all"
                >
                  <PlayCircle className="w-4 h-4" />
                  See How It Works
                </a>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">2,400+</span> students learning
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Illustration */}
            <div className="relative">
              <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium opacity-90">Overall Progress</span>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-3xl font-bold mb-2">78%</div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: BookOpen, title: 'Python for Beginners', progress: 85, colorBg: 'bg-blue-100', colorText: 'text-blue-600', colorBar: 'bg-blue-500' },
                    { icon: Globe, title: 'Web Development', progress: 62, colorBg: 'bg-emerald-100', colorText: 'text-emerald-600', colorBar: 'bg-emerald-500' },
                    { icon: Zap, title: 'Data Science', progress: 45, colorBg: 'bg-amber-100', colorText: 'text-amber-600', colorBar: 'bg-amber-500' },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className={`w-9 h-9 rounded-lg ${c.colorBg} flex items-center justify-center`}>
                        <c.icon className={`w-4 h-4 ${c.colorText}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-slate-700 mb-1">{c.title}</div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${c.colorBar} rounded-full`} style={{ width: `${c.progress}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-600">{c.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-slate-100 flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">12 Badges</div>
                  <div className="text-[10px] text-slate-500">Earned</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          WHY CHOOSE US — STATS
      ============================================ */}
      <section id="why" className="py-16 bg-gradient-to-b from-blue-50/60 via-indigo-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm mb-3">
              <Target className="w-4 h-4" />
              <span>Why Choose Us</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Trusted by thousands of learners
            </h2>
            <p className="text-lg text-slate-600">
              We're committed to giving every student the best possible learning experience.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { value: '10k+', label: 'Happy Students', gradient: 'from-blue-500 to-blue-700' },
              { value: '4.8', label: 'Average Rating', gradient: 'from-indigo-500 to-indigo-700' },
              { value: '95%', label: 'Success Rate', gradient: 'from-sky-500 to-sky-700' },
            ].map((s, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-8 text-center border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                  i === 1 ? 'md:scale-105 border-blue-300/60 shadow-md' : ''
                }`}
              >
                <div className={`text-5xl font-extrabold mb-3 bg-gradient-to-br ${s.gradient} bg-clip-text text-transparent`}>
                  {s.value}
                </div>
                <div className="text-slate-600 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Features Row */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: GraduationCap, title: 'Expert Faculty', desc: 'Learn from industry experts with years of real-world experience.', bg: 'bg-blue-100', text: 'text-blue-600' },
              { icon: Shield, title: 'Verified Content', desc: 'Every course is reviewed and updated to match industry standards.', bg: 'bg-emerald-100', text: 'text-emerald-600' },
              { icon: Heart, title: 'Student First', desc: 'We build every feature with the student learning experience in mind.', bg: 'bg-rose-100', text: 'text-rose-600' },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-5 bg-white rounded-2xl border border-slate-200/60">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0`}>
                  <f.icon className={`w-6 h-6 ${f.text}`} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES SECTION
      ============================================ */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm mb-3">
              <Zap className="w-4 h-4" />
              <span>Features</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything you need to learn
            </h2>
            <p className="text-lg text-slate-600">
              From video lessons to assignments, track every step of your learning journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: PlayCircle, title: 'Video Lessons', desc: 'Watch HD video lessons from expert instructors, available anytime, anywhere.', bg: 'bg-blue-50', text: 'text-blue-600' },
              { icon: FileText, title: 'Study Materials', desc: 'Access PDFs, cheatsheets, and documents to deepen your understanding.', bg: 'bg-emerald-50', text: 'text-emerald-600' },
              { icon: Users, title: 'Live Classes', desc: 'Join live interactive sessions with faculty and fellow students.', bg: 'bg-amber-50', text: 'text-amber-600' },
              { icon: CheckCircle, title: 'Track Progress', desc: 'Mark materials as done and watch your progress grow in real-time.', bg: 'bg-purple-50', text: 'text-purple-600' },
              { icon: Award, title: 'Assignments', desc: 'Submit assignments and get evaluated by your instructors.', bg: 'bg-red-50', text: 'text-red-600' },
              { icon: TrendingUp, title: 'Analytics', desc: 'Visualize your learning journey with beautiful insights and stats.', bg: 'bg-indigo-50', text: 'text-indigo-600' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.text}`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
      ============================================ */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to start learning?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already mastering new skills on LearnNest.
          </p>
          <Link
            to={token ? '/dashboard' : '/login'}
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            {token ? 'Go to Dashboard' : 'Get Started Now'}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ============================================
          CONTACT US SECTION
      ============================================ */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 font-medium text-sm px-4 py-1.5 rounded-full mb-4">
              <Mail className="w-4 h-4" />
              <span>Get in Touch</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Contact <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Us</span>
            </h2>
            <p className="text-lg text-slate-600 mt-4">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left: Info Cards */}
            <div className="space-y-5">
              {[
                { icon: Mail, title: 'Email Us', value: 'hello@learnnest.com', bg: 'bg-blue-100', text: 'text-blue-600' },
                { icon: Phone, title: 'Call Us', value: '+1 (555) 123-4567', bg: 'bg-emerald-100', text: 'text-emerald-600' },
                { icon: MapPin, title: 'Visit Us', value: '123 Learning Street, Tech City, 10100', bg: 'bg-amber-100', text: 'text-amber-600' },
              ].map((c, i) => (
                <div key={i} className="flex gap-4 p-5 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/60 hover:shadow-md transition-all">
                  <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                    <c.icon className={`w-6 h-6 ${c.text}`} />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-1">{c.title}</div>
                    <div className="font-semibold text-slate-900">{c.value}</div>
                  </div>
                </div>
              ))}

              {/* Social Icons */}
              <div className="pt-4">
                <p className="text-sm font-medium text-slate-700 mb-3">Follow us</p>
                <div className="flex gap-3">
                  {[
                    { Icon: MessageCircle, hover: 'hover:bg-blue-100' },
                    { Icon: Share2, hover: 'hover:bg-sky-100' },
                    { Icon: AtSign, hover: 'hover:bg-pink-100' },
                    { Icon: Globe, hover: 'hover:bg-emerald-100' },
                    { Icon: Rss, hover: 'hover:bg-amber-100' },
                  ].map((s, i) => (
                    <a
                      key={i}
                      href="#"
                      className={`w-10 h-10 rounded-lg bg-slate-100 ${s.hover} flex items-center justify-center transition-colors`}
                    >
                      <s.Icon className="w-4 h-4 text-slate-600" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/60 shadow-sm">
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                  <input
                    type="text"
                    placeholder="How can we help?"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                  <textarea
                    rows="5"
                    placeholder="Your message..."
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Send Message
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER
      ============================================ */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">LearnNest</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                Empowering learners worldwide with modern, accessible education.
              </p>
              <div className="flex gap-2">
                {[MessageCircle, Share2, AtSign, Globe].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-300" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-white transition">Home</a></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#why" className="hover:text-white transition">Why Choose Us</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
              <p className="text-sm mb-3">Get the latest courses and updates.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© 2026 LearnNest. All rights reserved.</p>
            <p>Built with ❤️ for learners everywhere</p>
          </div>
        </div>
      </footer>
    </div>
  );
}